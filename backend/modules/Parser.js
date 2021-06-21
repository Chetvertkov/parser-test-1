const marketplaceDomain = 'https://www.wildberries.ru'

const fetch = require('node-fetch')
const cheerio = require('cheerio')

const Category = require('../models/Category')
const Item = require('../models/Item')

const uuid = require('uuid')


class Parser{
    static cleanUrl(url){
        let urlArr = url.replace(marketplaceDomain,'').split('?')

        return urlArr[0]
    }

    async analysePage(urlRaw){
        let pageContent = await this.loadPage(urlRaw)
        const $ = cheerio.load(pageContent.html)
        //Определяем инфу для этой категории
        let category = {
            path: Parser.cleanUrl(urlRaw),
            parent:''
        }
        category.name = $('.catalog-title').text()

        let categoryInDB = await this.findCategoryByPath(category.path)
        if(categoryInDB===null){
            category._id = uuid.v4()
            category = await Category.create(category)
        }else{
            category = categoryInDB
        }
        //Парсим sidemenu на предмет категорий

        await this.parseSideMenu(pageContent, category)

        // await this.parseCheckboxCategories(pageContent,category)

        //Парсим товары на странице
        await this.parseGoods(pageContent,category)

        return
    }

    async loadPage(urlRaw){
        let url = Parser.cleanUrl(urlRaw)
        let data = await fetch(marketplaceDomain+url)
        let html = await data.text()
        return {html,url}
    }

    async parseGoods(pageContent,parentCat){
        let html = pageContent.html
        const $ = cheerio.load(html)
        $('.j-open-full-product-card').each(async (ind,el)=>{
            let itemUrl = Parser.cleanUrl($(el).attr('href'))
            let itemPageContent = await this.loadPage(itemUrl)
            let itemPage = cheerio.load(itemPageContent.html)
            let itemObj = {
                article:'',
                name: '',
                brand: '',
                description: '',
                category:parentCat._id
            }
            itemObj.article = itemPage('.article > span').text()
            itemObj.brand = itemPage('.brand').text()
            itemObj.name = itemPage('.name').text()
            itemObj.description = itemPage('.j-description').text()
            console.log(itemObj)
            let itemInDB = await this.findItemByArticle(itemObj.article)
            if(itemInDB===null){
                itemObj._id = uuid.v4()
                let item = Item.create(itemObj)
                console.log('Writing in DB')
            }else{

            }

        })
    }

    async parseSideMenu(pageContent,parentCat){
        let html = pageContent.html
        const $ = cheerio.load(html)

        let sidemenu = $('.sidemenu')
        // console.log(sidemenu)
        sidemenu.children('li').children('ul').children('li').each(async (i,el)=>{
            let catLinkObj = $(el).children('a')
            let catTitle = catLinkObj.html()
            let catHref = catLinkObj.attr('href')
            let categoryInDB = await this.findCategoryByPath(catHref)
            console.log(catTitle+' | '+catHref+ " | "+ categoryInDB)
            if(categoryInDB===null){
                //создаем новую запись в бд
                let category = await Category.create({
                    _id: uuid.v4(),
                    path:catHref,
                    name:catTitle,
                    parent:parentCat._id
                })
            }else{

            }
            // console.log(catHref,category)
        })
    }

    async parseCheckboxCategories(pageContent){
        let html = pageContent.html
        const $ = cheerio.load(html)
        console.log(html)
        $('.list_left_xsubject').each((ind,el)=>{
            console.log(ind)
        })
    }

    async findCategoryByPath(path){
        return await Category.findOne({path: path});
    }

    async findItemByArticle(article){
        return await Item.findOne({article:article})
    }

}

module.exports = new Parser()