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
        text: 'SpringBoot',
        collapsed: true,
        base: '/springboot/',
        items: [
          { text: 'spring-boot日志', link: 'spring_boot_log' },
          { text: 'spring-boot切面', link: 'spring_boot_aop' },
          { text: 'spring-boot异常', link: 'spring_boot_exception' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yfdisme/yfd-blog.git' }
    ]
  }
})
