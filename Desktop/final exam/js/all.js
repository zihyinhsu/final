// console.log(api_path,token)

let productData=[];
function getProductList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
      productData = response.data.products;
      
    })
  }