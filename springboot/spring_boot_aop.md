# spring-boot-aop 面向切面的简单实现
1. 引入依赖
```xml
 <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```
2. 添加切面，@Around匹配规则见[aop学习](https://blog.csdn.net/weixin_43973161/article/details/126254687)
```java
package com.yfd.boot.aop.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Component
@Aspect
@Slf4j
public class TestAop {
    @Around("execution(public * com.yfd.boot.aop.controller.*Controller.*(..))")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        log.info("类名：{}", joinPoint.getTarget().getClass().getName());
        log.info("属性值：{}", joinPoint.getArgs());
        log.info("方法名：{}", joinPoint.getSignature().getName());
        Object ret = joinPoint.proceed();
        log.info("执行结果为：{}", ret);
        return ret;
    }
}
```
3. 项目中一般使用注解的方式实现切面的功能
- 自定义注解
```java
package com.yfd.boot.aop.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAop {
    String value() default "";
}
```
- 切面
```java
package com.yfd.boot.aop.config;

import com.yfd.boot.aop.annotation.MyAop;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class TestMyAop {
    @Around("@annotation(myAop)")
    public Object around(ProceedingJoinPoint joinPoint, MyAop myAop) throws Throwable {
        log.info("类名1：{}", joinPoint.getTarget().getClass().getName());
        log.info("属性值1：{}", joinPoint.getArgs());
        log.info("方法名1：{}", joinPoint.getSignature().getName());
        Object ret = joinPoint.proceed();
        log.info("执行结果为1：{}", ret);
        return ret;
    }
}
```