import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors'

dotenv.config();
const app: Express = express();
app.use(cors());
const port = process.env.PORT;
const wp_url = "http://layer404.biz/wp-json/wp/v2/"
const API_ENDPOINT= {
  POSTS: "posts/",
  CATEGORIES: "categories/",
  TAGS: "tags/",
  MEDIA: "media/",
  USERS: "users/",
  SEARCH: "search/",
}
const _Request = async (endpoint: "POSTS" | "TAGS" | "CATEGORIES" | "MEDIA" | "USERS" | "SEARCH", Id?:any) => {
    let url = wp_url+API_ENDPOINT[endpoint]
    if (Id) url = url + Id;
    const {data} = await axios(url);
    return data
}

app.get('/', (req: Request, res: Response)=> {
  res.send('app running')
})
app.get('/posts', async (req: Request, res: Response) => {
  const data = await _Request('POSTS')
  res.json(data)
});

app.get('/posts/:slug', async (req: Request, res: Response) => {
  try {
    const data = await _Request('POSTS');
  const categories = await _Request('CATEGORIES');
  const author = await _Request("USERS");
  const tags = await _Request('TAGS');
  let result = data.find(({slug}: any) => slug === req.params.slug)
  const category:any = []
  result.categories.map((id:any)=> {
      const arr = categories.filter((v:any)=> v.id === id)
      category.push(arr[0])
  })

  result.categories = category.filter((v:any)=> v.id !== 1)
  result.author = author.find((v:any)=> v.id === result.author)
  const tag:any = [];
  result.tags.map((id:any)=> {
    const arr = tags.filter((v:any)=> v.id === id)
    tag.push(arr[0])
  })
  result.tags = tag
  result.featured_media = await _Request("MEDIA", result.featured_media).then((v:any)=> v.source_url)
  delete result._links
  res.send(result)
  } catch (error) {
    res.send('error')
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});