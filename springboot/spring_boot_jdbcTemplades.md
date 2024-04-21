# spring-boot-jdbtemplates springboot整合jdbc
1. 引入依赖
```xml
  <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.28</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
```
2. yml配置
```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/spring_boot
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver

```
3. 构造器方式注入JdbcTemplate,实现增删改查
```java
package com.yfd.boot.jdbc.service;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@AllArgsConstructor
public class JdbcServiceImpl {
    private final JdbcTemplate jdbcTemplate;

    public void insert() {
        jdbcTemplate.update("insert into user (id,age,name) values (1,18,'yfd')");
    }

    public Map<String, Object> select() {
        return jdbcTemplate.queryForMap("select * from user where id =?", 1);
    }

    public void update() {
        jdbcTemplate.update("update user set age=? ,name=? where id=?", 19, "szl",1);
    }
    public void delete() {
        jdbcTemplate.update("delete from user where id=?", 1);
    }
}
```

