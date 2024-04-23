# servlet 生命周期
- init 初始化（执行一次），servlet 对象是单例的，存在线程安全为你
- service 具体的执行逻辑（可多次执行）
- destroy 销毁在程序终止前执行，用于释放资源，必须是正常关闭服务（执行一次）
- `<load-on-startup>5</load-on-startup>` 为正数项目启动时加载，复数第一次调用时加载
#

