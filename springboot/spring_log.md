# spring-boot 日志
springboot默认的日志门面sl4j 日志实现logback
# 默认日志文件配置
```yaml
logging:
  file:
    name: 'log/app.text'
```
# 自定义日志文件配置
1. 在resource目录下创建一个logback-spring.xml
```xml
<configuration>
    <property name="FILE_LOG_CHARSET" value="${FILE_LOG_CHARSET:-${file.encoding:-UTF-8}}"/>
    <property name="FILE_LOG_THRESHOLD" value="${FILE_LOG_THRESHOLD:-TRACE}"/>
    <springProperty scope="context" name="spring_boot_log" source="spring.application.name" defaultValue="yfd"/>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <!-- encoders are assigned the type
             ch.qos.logback.classic.encoder.PatternLayoutEncoder by default -->
        <encoder>
            <pattern>%X{user_id} -->>> ${spring_boot_log} >> %d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} -%kvp- %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>${FILE_LOG_THRESHOLD}</level>
        </filter>
        <encoder>
            <pattern>%X{user_id} >> ${spring_boot_log} >> %d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} -%kvp- %msg%n</pattern>
            <charset>${FILE_LOG_CHARSET}</charset>
        </encoder>
        <file>./log/app.text</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOGBACK_ROLLINGPOLICY_FILE_NAME_PATTERN:-${LOG_FILE}.%d{yyyy-MM-dd}.%i.text}
            </fileNamePattern>
            <cleanHistoryOnStart>${LOGBACK_ROLLINGPOLICY_CLEAN_HISTORY_ON_START:-true}</cleanHistoryOnStart>
            <maxFileSize>1KB</maxFileSize>
            <!--标签定义了所有日志文件的总大小上限,如果未定义则默认为 0，表示无限制-->
            <totalSizeCap>${LOGBACK_ROLLINGPOLICY_TOTAL_SIZE_CAP:-0}</totalSizeCap>
            <!--保留历史文件7天-->
            <maxHistory>${LOGBACK_ROLLINGPOLICY_MAX_HISTORY:-7}</maxHistory>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```
2. springProperty 标签是spring的可以定义一些属性
3. <file>./log/app.text</file> 设置日志文件输出的路径
# MDC (Mapped Diagnostic Context)
1. 在代码中加入 `MDC.put("user_id","yfd1000");`
2. 在xml文件中控制台或者文件输出中添加 `%X{user_id}`
