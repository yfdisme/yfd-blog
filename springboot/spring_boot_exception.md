# spring-boot-exception springBoot 统一处理异常
1. springboot提供统一异常的处理的注解 `@ControllerAdvice`
2. 写一个配置类
-  `@ResponseBody`  以json格式返回给前端
-  `@ExceptionHandler(Exception.class)`  异常拦截注解`Exception.class`可以是自定义的注解
```java
package com.yfd.boot.exception.config;

import com.yfd.boot.exception.r.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@Slf4j
@ControllerAdvice
public class MyExceptionHandler {
    @ResponseBody
    @ExceptionHandler(Exception.class)
    public R<Object> error(Exception e) {
        log.error(e.getMessage(), e);
        return R.fail(e.getMessage());
    }
}
```