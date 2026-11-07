# spring-boot-async @Async异步任务 + 自定义线程池 + Future获取结果

场景：批量下载财务公司回单文件，串行下载很慢，把每个文件的下载丢到自定义线程池里异步执行，最后统一收集结果。

1. 启动类或配置类上开启异步支持 `@EnableAsync`，并定义线程池
```java
package com.yfd.boot.async.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * 自定义线程池，@Async("receiptExecutor") 通过 bean 名字指定使用它
     * 不指定名字时会去找唯一的 ThreadPoolTaskExecutor 或默认的 SimpleAsyncTaskExecutor
     */
    @Bean("receiptExecutor")
    public Executor receiptExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // 核心线程数
        executor.setCorePoolSize(8);
        // 最大线程数
        executor.setMaxPoolSize(16);
        // 队列容量
        executor.setQueueCapacity(200);
        // 线程名前缀，方便排查日志
        executor.setThreadNamePrefix("receipt-exec-");
        // 拒绝策略：队列满时由调用线程自己执行，不丢任务
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        // 应用关闭时等待任务执行完再关
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}
```
2. 写异步任务类：方法加 `@Async("receiptExecutor")`，调用后立刻返回，方法体跑在线程池的线程里
- 返回值用 `Future<RcptFileDownloadDto>`，方法内部用 `new AsyncResult<>(dto)` 包装结果
- 这个方法就做四件事：①计时 ②下载落盘 ③更新回单状态 ④组装结果返回
```java
package com.yfd.boot.async.task;

import cn.hutool.core.io.FileUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.File;
import java.io.InputStream;
import java.util.concurrent.Future;

@Slf4j
@Component
public class ReceiptSyncTask {

    @Resource
    private TEleRcptMapper tEleRcptMapper;

    /**
     * 单个回单文件的下载任务
     * 调用后立刻返回 Future，下载在 receiptExecutor 线程池里异步执行
     */
    @Async("receiptExecutor")
    public Future<RcptFileDownloadDto> downloadFileExecutor(FileManagementClient fileManagementClient,
                                                            TEleRcpt detailEleRcpt, File fileNm) {
        // ① 记下开始时间，方法末尾统计总耗时
        long executing = System.currentTimeMillis();
        log.info("开始下载文件, 回单id:{}", detailEleRcpt.getId());

        // ② 下载大文件：拿到输入流，直接写成目标文件（Hutool 的 FileUtil）
        InputStream inputStream = fileManagementClient.downloadLargeFile(detailEleRcpt.getPdfPath());
        File downloaded = FileUtil.writeFromStream(inputStream, fileNm);

        // ③ 下载成功后更新回单状态：isPrint 置为"1"并落库
        //    下载和状态更新在同一个异步线程里按顺序执行，天然不会乱序
        detailEleRcpt.setIsPrint("1");
        tEleRcptMapper.updateEleSignRlt(detailEleRcpt);

        // ④ 输出总耗时，把下载好的文件和回单记录包进 DTO，用 AsyncResult 包装返回
        log.warn("财务公司回单下载线程处理用时 {} ms", System.currentTimeMillis() - executing);
        RcptFileDownloadDto downloadDto = new RcptFileDownloadDto(downloaded, detailEleRcpt);
        return new AsyncResult<>(downloadDto);
    }
}
```
- 逐段看懂：① 记开始时间，结尾算差值输出耗时，线程池里的任务慢了能从日志发现；② `downloadLargeFile` 返回输入流，`FileUtil.writeFromStream` 把流落成本地文件；③ 下载成功才更新状态，两步在同一线程串行执行；④ `AsyncResult` 只是个"稍后才就绪的结果"占位，调用方 `get()` 时才真正拿到值
3. 调用方注入任务类，批量提交任务拿到一串 `Future`，再逐个限时等待收集结果
- 提交阶段不阻塞；`get(5, TimeUnit.MINUTES)` 才会等待，单个任务最多等5分钟
```java
package com.yfd.boot.async.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class ReceiptSyncService {

    // 注意：必须注入另一个类调用，同类内部调用 @Async 会失效
    @Resource
    private ReceiptSyncTask receiptSyncTask;

    public void syncReceipt(List<TEleRcpt> rcptList) {
        // 1. 批量提交异步任务，立刻拿到一串 Future（提交即返回，不阻塞）
        List<Future<RcptFileDownloadDto>> fileDownloaded = new ArrayList<>();
        for (TEleRcpt detailEleRcpt : rcptList) {
            File fileNm = new File(downloadDir, detailEleRcpt.getFileName());
            Future<RcptFileDownloadDto> download =
                    receiptSyncTask.downloadFileExecutor(fileManagementClient, detailEleRcpt, fileNm);
            fileDownloaded.add(download);
        }

        // 2. 逐个限时等待并收集结果（前面的任务在等待时，其余任务仍在并行下载）
        List<RcptFileDownloadDto> successList = new ArrayList<>();
        for (Future<RcptFileDownloadDto> download : fileDownloaded) {
            try {
                successList.add(download.get(5, TimeUnit.MINUTES));
            } catch (Exception e) {
                // 异步方法里没捕获的异常，会在 get() 这里以 ExecutionException 抛出
                log.error("获取下载结果失败", e);
            }
        }
        log.info("收据文件下载完成，成功{}个", successList.size());
    }
}
```
4. 注意事项（踩坑点）
- `@Async` 失效场景：同类内部调用不经过代理（如 `this.downloadFileExecutor()`），必须注入另一个类调用，或者把方法拆到别的类
- 带返回值的 `@Async` 方法只能返回 `void`、`Future`、`CompletableFuture`，返回其他类型会拿到 `null`
- 上面的下载方法没有 try/catch：一旦下载或落盘抛异常，这个 Future 会以"异常完成"收场，调用方 `get()` 时抛 `ExecutionException` 被catch住；想让任务内部消化异常，就套一层 try/catch 返回失败的 DTO
- 一定要给线程池指定 bean 名字并设置 `threadNamePrefix`，否则多线程池时容易注入错，日志也不好排查
- 子线程拿不到主线程的 `ThreadLocal`、`RequestContextHolder`（如登录用户信息），需要通过方法参数传进去（上面的写法参数都显式传了，没问题）
- 线程池参数：IO 密集（如下载文件）核心线程数可以设为 CPU 核数的 2~3 倍
- 想升级成更优雅的写法：返回类型改成 `CompletableFuture`、用 `CompletableFuture.completedFuture(dto)` 返回，调用方用 `CompletableFuture.allOf(...).get(超时)` 限时等待全部完成后再流式收集；轮询判断 `stream().allMatch(Future::isDone)` 也可以，但注意 `isDone()` 为 true 只代表"已完成"（含异常、取消），不代表"成功"，且轮询没有超时上限
- 不想被代理限制也可以直接 `CompletableFuture.supplyAsync(() -> {...}, receiptExecutor)` 代替 `@Async`，JUC 线程池基础见[java JUC](/JavaEE/java_juc)
