import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "yfd-blog",
  description: "A VitePress Site",
  lang: 'zh-CN',
  base: '/yfd-blog',
  head: [
    ['link', {rel: 'icon', href: '/yfd-blog/favicon.ico'}]
  ],
  themeConfig: {
    search: {
      provider: 'local'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '参考', link: '/guide/vitepress-start' }
    ],

    sidebar: [
      {
        text: 'vitepress搭建博客',
        collapsed: true,
        base: '/guide/',
        items: [
          { text: '起步', link: 'vitepress-start' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: 'java ee',
        collapsed: true,
        base: '/JavaEE/',
        items: [
          { text: 'java SPI思想', link: 'java_spi' },
          { text: 'java JDBC', link: 'java_jdbc' }
        ]
      },
      {
        text: 'Servlet',
        collapsed: true,
        base: '/servlet/',
        items: [
          { text: 'servlet 快速入门', link: 'servlet_one' },
          { text: 'servlet 生命周期', link: 'servlet_two' },
          { text: 'servlet ', link: 'servlet_two' }
        ]
      },
      {
        text: 'SpringBoot',
        collapsed: true,
        base: '/springboot/',
        items: [
          { text: 'spring-boot日志', link: 'spring_boot_log' },
          { text: 'spring-boot切面', link: 'spring_boot_aop' },
          { text: 'spring-boot异常', link: 'spring_boot_exception' },
          { text: 'spring-boot JDBC', link: 'spring_boot_jdbcTemplades' },
          { text: 'spring-boot Mybatis', link: 'spring_boot_mybatis' },
          { text: 'spring-boot 配置文件', link: 'spring_boot_metadate_format' },
          { text: 'spring-boot 监控及自定义', link: 'spring_boot_actuator' },
          { text: 'spring-boot 图形化监控', link: 'spring_boot_admin' }
        ]
      },
      {
        text: 'GitLabCICD',
        collapsed: true,
        base: '/GitLabCICD/',
        items: [
          { text: 'gitlabcicd基础', link: 'gitlabcicd基础' }
        ]
      },
      {
        text: '定时任务',
        collapsed: true,
        base: '/xxl-job/',
        items: [
          { text: 'xxl-job + springboot', link: 'xxl_job' }
        ]
      },
      {
        text: 'linux',
        collapsed: true,
        base: '/linux/',
        items: [
          { text: 'nginx', link: 'nginx' }
        ]
      },
      {
        text: 'c&c++',
        collapsed: true,
        base: '/c_cPlus/',
        items: [
          { text: 'nginx', link: 'nginx' }
        ]
      },
    ],



    socialLinks: [
      { icon: 'github', link: 'https://github.com/yfdisme/yfd-blog.git' }
    ]
  }
})
