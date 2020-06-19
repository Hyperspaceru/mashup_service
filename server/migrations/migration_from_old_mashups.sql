select id , substring(post_link,'(?<=\-)[0-9]*') as gid ,post_link,author,title,image_url,image_path,audio_path,video_path,youtube_link,status,creation_time,creation_time from mashup
-- select substring(post_link,'(?<=\-)[0-9]*') as gid , post_link from mashup
insert into mashups ("id","publicId","postLink",author,title,"imageUrl","imagePath","audioPath","videoPath","youtubeLink",status,"createdAt","updatedAt") select "id" , CAST(substring(post_link,'(?<=\-)[0-9]*') as integer) as gid ,post_link,author,title,image_url,image_path,audio_path,video_path,youtube_link,status,creation_time,creation_time from mashup
update mashups set approve = true where "youtubeLink" is not null
update mashups set "imagePath" = null, "audioPath" = null, "videoPath"=null where "youtubeLink" is null