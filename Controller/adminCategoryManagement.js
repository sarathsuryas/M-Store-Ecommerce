
const Category = require('../model/categorySchema')
const Product = require('../model/productSchema')



const productcategories  = async (req,res,next) =>{
  try{
    const page = parseInt(req.query.page) || 1;
const no_of_docs_each_page = 4;
const totalCategory = await Category.countDocuments() 
const totalPages = Math.ceil(totalCategory / no_of_docs_each_page)
const skip = (page - 1) * no_of_docs_each_page
const  categories  = await Category.find().skip(skip).limit(no_of_docs_each_page)

const catexist = req.session.catexist;
return res.render('ADMIN/productcategories',{categories,catexist,totalPages,page})
  }catch(error){
    next(error)
  }
}

const addcat = async (req,res,next) =>{
  
  try{
    const {name,description} = req.body;
  
    const regexTitle = new RegExp(name, 'i'); // 'i' for case insensitive
    const category = await Category.findOne({categoryName: {$regex: regexTitle}});
    if(category){
      req.session.catexist = 'category exist'
    return res.redirect('/admin/productcategories')
    }



   const data = await Category.create({categoryName:name,description:description})
   req.session.catexist = ''
   return res.redirect('/admin/productcategories')
  }catch(err){
    next(err)
  }
  }

  //publish and unpublish category
const publish = async (req,res,next) =>{
  const categoryId = req.params.id;

  try{
    const category = await Category.findById(categoryId)
    if(!category){
      return res.status(404).json({error:'User not found'});
    }
    if(category.isListed === false){
      category.isListed = true
    }else{
      category.isListed = false;
    }
    await category.save()

    //update all the product in the category
    
    await Product.updateMany(
      {category:categoryId},
      {$set:{isListed:category.isListed} }
      ) 
      return res.status(200).json({success:true,message:'success true'})  
  }
  catch(error){
    next(error)
  }
}


const updateCat = async (req,res,next) =>{
  try{
const categoryId = req.params.id;
const details = await Category.findById(categoryId)
const existing = req.session.existing

  return res.render('ADMIN/updatingCategories',{details,existing})
  }catch(error){
    next(error)

  }
}

const updatedCat = async (req,res,next) =>{
  const {id,categoryname,description} = req.body;
  try{
   
   const updatedCategory = await Category.findByIdAndUpdate(id,{categoryName:categoryname,description:description},{new:true})
 
   if (!updatedCategory) {
     return res.status(404).json({ error: 'Category not found' });
   }
     
   return res.redirect('/admin/productcategories')
  } catch (error) {
   next(error)
     }
 }

 module.exports = {productcategories,addcat,publish,updateCat,updatedCat}