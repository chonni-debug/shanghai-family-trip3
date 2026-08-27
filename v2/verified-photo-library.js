'use strict';

/*
 * Exact-place photo library.
 *
 * Each entry is keyed by the destination's Chinese name. The image URL uses
 * Wikimedia Commons' stable Special:Redirect endpoint at a mobile-friendly
 * width. Attribution metadata is kept next to the mapping so cards can show
 * the photographer/license and link back to the file-description page.
 */
const VERIFIED_PHOTO_LIBRARY={
  '上海星巴克臻选烘焙工坊':{
    image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Starbucks%20Reserve%20Roastery%20Shanghai%2001.jpg?width=1280',
    credit:{author:'Codas',license:'CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:Starbucks_Reserve_Roastery_Shanghai_01.jpg'}
  },
  '人民广场':{
    image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Shanghai%20People%27s%20Square%20%2810177646615%29.jpg?width=1280',
    credit:{author:'Gary Todd',license:'CC0 1.0',source:'https://commons.wikimedia.org/wiki/File:Shanghai_People%27s_Square_%2810177646615%29.jpg'}
  },
  '黄河路':{
    image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/20240120%20Night%20view%20of%20Huanghe%20Road%2C%20Shanghai%2004.jpg?width=1280',
    credit:{author:'Windmemories',license:'CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:20240120_Night_view_of_Huanghe_Road%2C_Shanghai_04.jpg'}
  },
  '淮海中路':{
    image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/20260209%201897%20Middle%20Huaihai%20Road.jpg?width=1280',
    credit:{author:'Windmemories',license:'CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:20260209_1897_Middle_Huaihai_Road.jpg'}
  },
  '龙井村':{
    image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/20260424%20Longjing%20Village.jpg?width=1280',
    credit:{author:'Windmemories',license:'CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:20260424_Longjing_Village.jpg'}
  },
  '上海中心大厦':{
    image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Shanghai%20Tower%20%2874449%29.jpg?width=1280',
    credit:{author:'Janak Bhatta',license:'CC BY 4.0',source:'https://commons.wikimedia.org/wiki/File:Shanghai_Tower_%2874449%29.jpg'}
  },
  '上海国金中心商场':{
    image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/201805%20IFC%20Mall%20Shanghai.jpg?width=1280',
    credit:{author:'MNXANL',license:'CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:201805_IFC_Mall_Shanghai.jpg'}
  }
};

function verifiedPhotoFor(cn){return VERIFIED_PHOTO_LIBRARY[String(cn||'').trim()]||null}
function applyVerifiedPhotoLibrary(data){
  if(!data)return data;
  const apply=item=>{
    if(!item?.cn)return;
    const found=verifiedPhotoFor(item.cn);
    if(!found)return;
    item.image=found.image;
    item.photoVerified=true;
    item.photoCredit={...found.credit};
  };
  (data.days||[]).forEach(day=>(day.events||[]).forEach(apply));
  (data.places||[]).forEach(apply);
  return data;
}
