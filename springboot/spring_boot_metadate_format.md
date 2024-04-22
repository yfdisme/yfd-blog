# spring-boot-metadata-format springBoot配置文件读取及自动提示
1. 自定义配置文件
- `@Configuration`
- `@ConfigurationProperties(prefix = "user")` 
```java
package com.yfd.boot.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "user")
public class UserConfig {
    /**
     * 姓名
     */
    private String username;
    /**
     * 年龄
     */
    private Integer age;

}
```
```yaml
user:
  username: yfd
  age: 18
```
2. 添加依赖
- 自定生成到目录 target/classes/META-INF/spring-configuration-metadata.json 可以在yml文件中自动提示
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

```json
{
  "groups": [
    {
      "name": "user",
      "type": "com.yfd.boot.config.UserConfig",
      "sourceType": "com.yfd.boot.config.UserConfig"
    }
  ],
  "properties": [
    {
      "name": "user.age",
      "type": "java.lang.Integer",
      "description": "年龄",
      "sourceType": "com.yfd.boot.config.UserConfig"
    },
    {
      "name": "user.username",
      "type": "java.lang.String",
      "description": "姓名",
      "sourceType": "com.yfd.boot.config.UserConfig"
    }
  ],
  "hints": []
}
```