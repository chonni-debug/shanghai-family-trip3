# Verified photo sources

These exact-place photos are used by `/v2/verified-photo-library.js`. The app links back to each source from the photo badge.

| Destination | Source file | Author | License |
| --- | --- | --- | --- |
| 上海星巴克臻选烘焙工坊 | https://commons.wikimedia.org/wiki/File:Starbucks_Reserve_Roastery_Shanghai_01.jpg | Codas | CC BY-SA 4.0 |
| 人民广场 | https://commons.wikimedia.org/wiki/File:Shanghai_People%27s_Square_%2810177646615%29.jpg | Gary Todd | CC0 1.0 |
| 黄河路 | https://commons.wikimedia.org/wiki/File:20240120_Night_view_of_Huanghe_Road%2C_Shanghai_04.jpg | Windmemories | CC BY-SA 4.0 |
| 淮海中路 | https://commons.wikimedia.org/wiki/File:20260209_1897_Middle_Huaihai_Road.jpg | Windmemories | CC BY-SA 4.0 |
| 龙井村 | https://commons.wikimedia.org/wiki/File:20260424_Longjing_Village.jpg | Windmemories | CC BY-SA 4.0 |
| 上海中心大厦 | https://commons.wikimedia.org/wiki/File:Shanghai_Tower_%2874449%29.jpg | Janak Bhatta | CC BY 4.0 |
| 上海国金中心商场 | https://commons.wikimedia.org/wiki/File:201805_IFC_Mall_Shanghai.jpg | MNXANL | CC BY-SA 4.0 |

## Policy

- A photo is attached only to the exact Chinese destination key listed in the library.
- Neighbourhood or ambience photos are not reused as exact destination photos.
- If no exact verified photo exists, the UI shows the bilingual `photo not yet verified` placeholder instead.
- Remote Commons images are requested at a mobile-friendly width. Once loaded while the PWA is online, the service worker may cache the response for later offline use.
- Licenses and attribution must remain intact if the library is copied or redistributed.
