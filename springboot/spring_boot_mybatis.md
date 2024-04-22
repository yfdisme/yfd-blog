# spring-boot-mybatis springBoot 整合mybatis
1. 引入依赖
```xml
 <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>3.0.3</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter-test</artifactId>
            <version>3.0.3</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.28</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
    </dependencies>
```
2. 配置yml 
 - [spring boot框架mybatis.mapper-locations配置问题详解](https://blog.csdn.net/weixin_40160361/article/details/103876250)
```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/spring_boot
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
# 配置resource目录下的xml路径
mybatis:
  mapper-locations: classpath:mapper/*.xml
  configuration:
    map-underscore-to-camel-case: true
# 展示执行的sql日志
logging:
  level:
    com:
      yfd:
        boot:
          mapper:  debug

```
3. mapper.xml 文件
- `useGeneratedKeys="true" keyProperty="userId"` 插入语句执行后配置这2个属性可以获取到主键id
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.yfd.boot.mapper.UserMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="userId" parameterType="com.yfd.boot.entity.User">
       insert into user (age,name) values (#{user.age},#{user.name})
    </insert>
    <select id="selectByPrimaryKey" resultType="com.yfd.boot.entity.User">
        select user_id,name,age from user where user_id = #{id}
    </select>
</mapper>
```
4. mapperInterface
- @Mapper
```java
package com.yfd.boot.mapper;

import com.yfd.boot.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int deleteByPrimaryKey(Integer id);
    int insert(@Param("user") User user);
    User selectByPrimaryKey(Integer id);
    int updateByPrimaryKey(User record);

}

```
5. 反向生成代码使用esaycode 插件