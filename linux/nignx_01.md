# nginx 配置upstream

###1. 使用upstream实现负载均衡
- 配置
```shell
#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;
    upstream yuxin {
      server 192.168.211.132:8999;
	  server 192.168.211.129:8999;
    }
	
	
    server {
        listen       80;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            root   html;
            index  index.html index.htm;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
    }

	#正向代理转发http请求
	server {
		#指定DNS服务器IP地址 
		resolver 114.114.114.114;
		#监听80端口，http默认端口80
		listen 80;
		#服务器IP或域名
		server_name  localhost;
		
		#正向代理转发http请求
		location / {
			proxy_pass                 http://$host$request_uri;
			proxy_set_header           HOST $host;
			proxy_buffers              256 4k;
			proxy_max_temp_file_size   0k;
			proxy_connect_timeout      30;
			proxy_send_timeout         60;
			proxy_read_timeout         60;
			proxy_next_upstream error  timeout invalid_header http_502;
		}
	}

	#正向代理转发https请求
	server {
		#指定DNS服务器IP地址 
		resolver 114.114.114.114;
		#监听443端口，https默认端口443
		listen 443;
		
		#正向代理转发https请求
		proxy_connect;
		proxy_connect_allow            443 563;
		proxy_connect_connect_timeout  10s;
		proxy_connect_read_timeout     10s;
		proxy_connect_send_timeout     10s;
		location / {
			proxy_pass http://$host;
			proxy_set_header Host $host;
		}
	}


    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}
	include /usr/local/nginx/conf.d/*.conf;

}


```
- 存在的问题
  upstream 其中一台服务器挂了，在错误日志中会记录到又请求发送到已经挂掉的服务器，会再次请求到存活的服务器，
  返回正常结果
  在你提供的 Nginx 配置示例中，默认情况下，如果其中一台服务器挂了，Nginx 仍然可能会继续向它发送请求，因为没有配置任何健康检查或故障处理策略。为了避免这一情况，你需要添加一些配置来让 Nginx 检测到服务器的故障并停止向其发送请求。

- 推荐的配置，你可以通过设置 `max_fails` 和 `fail_timeout` 来实现基本的健康检查。例如：

    ```nginx
    upstream yuxin {
         server 192.168.211.132:8999 max_fails=3 fail_timeout=30s;
         server 192.168.211.129:8999 max_fails=3 fail_timeout=30s;
    }
    ```
    
    在上述配置中，如果某个服务器在 `fail_timeout` 时间（30秒）内连续 `max_fails` 次失败，Nginx 会将该服务器标记为不可用，并在接下来的 `fail_timeout` 时间内不再向该服务器发送请求。
    
    此外，为了更高级的健康检查，你可以使用 Nginx 的 `ngx_http_upstream_check_module` 模块（需要第三方模块），或者使用商业版的 Nginx Plus，它提供了内建的健康检查功能。
    
    以下是一个使用 `ngx_http_upstream_check_module` 的示例配置：
    
    ```nginx
    http {
        upstream yuxin {
            server 192.168.211.132:8999;
            server 192.168.211.129:8999;
    
            # 使用第三方模块 ngx_http_upstream_check_module 进行健康检查
            check interval=5000 rise=2 fall=5 timeout=1000 type=http;
        }
    
        server {
            listen 80;
    
            location / {
                proxy_pass http://yuxin;
            }
        }
    
        # 定义健康检查的请求路径和期望的响应码
        check_http_send "GET /health HTTP/1.0\r\n\r\n";
        check_http_expect_alive http_2xx;
    }
    ```
    
    在这个配置中，健康检查会每5秒钟发送一次HTTP请求到 `/health` 路径，并且如果连续两次返回2xx状态码，则认为服务器是健康的；如果连续五次失败，则认为服务器是不可用的。
    
    总结起来，通过合理配置健康检查参数，Nginx 可以在检测到上游服务器挂掉时停止向其发送请求，从而提高系统的可靠性。

###2. 参数说明
   `max_fails` 和 `fail_timeout` 是 Nginx 中用于控制后端服务器故障恢复策略的配置参数。它们通常在定义上游服务器（upstream servers）时使用。在理解这两个参数的具体用法之前，我们需要了解它们的背景和作用。

### max_fails

- **作用**：指定在 `fail_timeout` 时间内，后端服务器允许失败的最大次数。
- **默认值**：1
- **使用场景**：当一个后端服务器在处理请求时发生故障，比如连接超时或响应错误，如果在 `fail_timeout` 时间内失败次数达到 `max_fails` 的设置值，该服务器将被认为不可用，并且不会再被尝试使用，直到 `fail_timeout` 过去。

### fail_timeout

- **作用**：指定服务器被标记为不可用后的超时时间。超过这个时间，Nginx 将重新尝试把请求发送到该服务器。
- **默认值**：10秒
- **使用场景**：在服务器被标记为不可用之后，这段时间内不会再尝试将请求发送到该服务器。超时后，服务器会被重新启用并参与负载均衡。

### 示例配置

假设我们有一个上游服务器组，配置如下：

```nginx
upstream backend {
    server backend1.example.com max_fails=3 fail_timeout=30s;
    server backend2.example.com max_fails=3 fail_timeout=30s;
    server backend3.example.com max_fails=3 fail_timeout=30s;
}
```

在这个例子中：
- `backend1.example.com`、`backend2.example.com` 和 `backend3.example.com` 都被配置了相同的故障恢复策略。
- 如果在 30 秒内，`backend1.example.com` 失败了 3 次（比如连接超时或其他错误），Nginx 会将该服务器标记为不可用。
- 在接下来的 30 秒内，Nginx 不会再将请求发送到 `backend1.example.com`。
- 30 秒之后，`backend1.example.com` 会被再次标记为可用，Nginx 将重新尝试将请求发送到该服务器。

### 实际使用建议

- **根据实际情况调整**：`max_fails` 和 `fail_timeout` 的设置应根据实际的网络环境和应用需求进行调整。例如，如果你的服务对延迟和可用性非常敏感，可以将 `fail_timeout` 设置得短一些。
- **监控和日志记录**：使用 Nginx 日志功能和监控工具来跟踪这些配置的效果，确保它们满足你的需求。

通过适当配置 `max_fails` 和 `fail_timeout` 参数，可以更好地管理后端服务器的故障，提升系统的稳定性和可靠性。