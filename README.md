# Mashup service

Mashup service is service that downloads posts from the public VK - [#mashup](https://vk.com/mashup), converts to video and uploads on YouTube

The service contains two parts - a frontend (/src), for moderating content (made on the react framework)
![front](./front.png)

 and a backend (/server) that serves as an API (made on expressjs), as well as managing the service.

 Service uses technologies like:
 * ffmpeg - for render video with complex effect and downloads m3u8
 * puppeteer - for grab audio from vk and for upload on Youtube (because youtube api has small quota for upload video)