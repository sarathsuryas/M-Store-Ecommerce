
const Category = require('../model/categorySchema')
const Product = require('../model/productSchema')


const productManagement = async(req,res,next)=>{

  try{

    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 5;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);

    const skip = (page - 1) * no_of_docs_each_page;

    const products = await Product
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(no_of_docs_each_page).populate({
        path: 'category',
        options: { strictPopulate: false }
      }).exec();

    const categories = await Category.find()
  //  /// strict populate  need change
  //   const products = await Product.find({}).populate({
  //     path: 'category',
  //     options: { strictPopulate: false }
  //   }).exec();
    const exist = req.session.exist;
    return res.render('ADMIN/productManagement',{categories,products,exist, totalPages, page})
  }catch(err){
    next(err); // Pass the error to the next middleware
  }
}

const addProduct = async (req,res,next) =>{
  try {
    const categories = await Category.find()
    const exist = req.session.exist
  delete req.session.exist
     return res.render('ADMIN/addProduct',{exist,categories})
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
  
}

const insertProduct = async (req,res,next) =>{
  
  const title = req.body.title;
  const regexTitle = new RegExp(title, 'i'); // 'i' for case insensitive
  const product = await Product.findOne({title: {$regex: regexTitle}});
    if(product){
      const categories = await Category.find()
      /// strict populate  need change
       const products = await Product.find({}).populate({
         path: 'category',
         options: { strictPopulate: false }
       }).exec();
       
       req.session.exist = 'product exist'

     return res.redirect('/admin/add-product')
    }  

  try{
  const product = new Product({
    title:req.body.title,
    description:req.body.description,
    price:req.body.price,
    category:req.body.category,
    stock:req.body.stock,
    discount:req.body.discount,
    coverImage:req.files.coverImage[0].path.replace(/\\/g, '/').replace('public/', '/'),
    productImages:req.files.productImages.map(file => file.path.replace(/\\/g, '/').replace('public/', '/'))
  })
 
  
  
await product.save()
  const categories = await Category.find()
    
    const products = await Product.find({}).populate({
      path: 'category',
      options: { strictPopulate: false }
    }).exec();

 return res.redirect('/admin/productmanagement')
}catch(err){
  next(err); // Pass the error to the next middleware
}
}

const productPublish = async(req,res,next) =>{
  const productId = req.params.id;
  try{
    const products = await Product.findById(productId)
    if(!products){
      return res.status(404).json({ error: 'User not found' });
    }
    if(products.isListed === false){
    products.isListed = true
    }else{
      products.isListed = false
    }
    await products.save()
    return res.status(200).json({success:true,message:'success true'})
    }
    catch(err){
      next(err); // Pass the error to the next middleware
    }
  
  }

  const editProduct = async (req,res,next) =>{
    const productId = req.params.id;
    const categories = await Category.find();
    console.log(categories);
    const products =await Product.findById(productId)
       return res.render('ADMIN/editProduct',{categories,products})
  }

  const editedProduct = async (req, res, next) => {
    const { id, title, description, price, category, stock, discount } = req.body;
     try{
  
      const product = await Product.findById(id)
      product.title=title
      product.description=description
      product.price=price
      product.category=category
      product.stock=stock
      product.discount=discount
     
      //check if the coverImage in the req.files
       if(req.files.coverImage){
        product.coverImage = req.files.coverImage[0].path.replace(/\\/g, '/').replace('public/', '/');
       }
       //check if the produuctImages in the req.files
       if(product.productImages.length<3){
     if(req.files.productImages){
       product.productImages.push(... req.files.productImages.map(file => file.path.replace(/\\/g, '/').replace('public/', '/'))) 
     }
    }
     
     await product.save()
     
     if(product){
      return res.redirect('/admin/productmanagement')
     }
  
     }catch(err){
      next(err); // Pass the error to the next middleware
     }
  };

  const deleteImage =  async (req,res,next) =>{
    try {
      const {productId,index} = req.body
      console.log(req.body)
      const product = await Product.findById(productId)
      product.productImages.splice(index,1)
      await product.save()
      return res.status(200).json({success:true})
    } catch (err) {
      next(err); // Pass the error to the next middleware
    }
  }


  
  module.exports = {productManagement,insertProduct,productPublish,editProduct,editedProduct,addProduct,deleteImage}