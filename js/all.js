const productList = document.querySelector('.productWrap');
const cartList=document.querySelector('.shoppingCart-tableList')
const productSelect = document.querySelector('.productSelect')

//初始化
function init(){
    getProductList();
    getCartList();
}
init();

//取得產品列表
let productData=[];
let cartData=[];

function getProductList(){ 
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
        productData = response.data.products;
        console.log(productData)
        renderProducts();
        getCategories();
    })
  }

//產品列表渲染
  function renderProducts(cate){
    let str='';
        const filterData=productData.filter(item=>{
            if(cate === item.category){
                return item
            }else if (!cate){
                return item
            }
        })
        filterData.forEach(item=>{
            str+=`<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>`
        })
        productList.innerHTML=str;
}

//取出category
function getCategories(){
    //先取出所有的category
    let unSort = productData.map(item=>{
        return item.category;
    })
    // console.log(unSort)
    //篩選出重複的category
    let sorted  = unSort.filter((item,i)=>{
        return unSort.indexOf(item)===i
    })
    // console.log(sorted)
    renderCategories(sorted)
}
// render Category
function renderCategories(sorted){
    let str='<option value="" selected>全部</option>';
    sorted.forEach(item=>{
        str+=`<option value="${item}">${item}</option>`
    })
    productSelect.innerHTML=str;
}

//篩選資料綁監聽 (監聽都寫在外層，innerHTML寫在內層)
productSelect.addEventListener('change',function(){
    renderProducts(productSelect.value)
})

// 加入購物車按鈕綁監聽 (監聽都寫在外層，innerHTML寫在內層)
productList.addEventListener('click',function(e){
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class")

    if(addCartClass !== "js-addCart"){
        return
    }

    const productId = e.target.getAttribute("data-id")

    //加入購物車的流程(點擊當下如果購物車內有一樣的品項，數量+=1，沒有的話就創造一項新的品項)
    let numCheck=1;
    cartData.forEach(item=>{
        if(item.product.id === productId){
            numCheck = item.quantity += 1; 
        }
    })
    // console.log(numCheck)
    
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
          }
    }).then(function(response){
        alert(`成功加入購物車`)
        getCartList()
    })
})

//取得購物車列表
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        cartData = response.data.carts;
        //計算購物車總金額
        const jsTotal = document.querySelector('.js-total')
        jsTotal.textContent = response.data.finalTotal;
        
        renderCart();
    })
}

//購物車列表渲染
function renderCart(){
    let str='';
    cartData.forEach(item=>{
        str+=`<tr>
        <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>${item.product.price}</td>
        <td>${item.quantity}</td>
        <td>${item.product.price * item.quantity}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${item.id}" data-product="${item.product.title}">
                clear
            </a>
        </td>
    </tr>`
    })
    cartList.innerHTML = str;
}

// 刪除購物車商品數量
cartList.addEventListener('click',function(e){
    e.preventDefault();
    const productName = e.target.getAttribute('data-product')
    const cartId=e.target.getAttribute('data-id')
    if(cartId == null){
        return;
    }

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
        alert(`刪除一筆${productName}品項成功`)
        getCartList();
    })

})

//刪除全部購物車流程
const disCardAllBtn = document.querySelector('.discardAllBtn');

disCardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        alert(`刪除全部購物車品項`)
        getCartList()
    })
    .catch(function(response){
        alert(`購物車已經清空!`)
    })
})

// 送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    if(cartData.length == 0){
        alert('請加入購物車');
        return;
    }

    const inputContent = document.querySelectorAll('.orderInfo-input');
    const alertMessage = document.querySelectorAll('.orderInfo-message');

    if(inputContent[0].value ==''){
        alert(`請輸入${alertMessage[0].dataset.message}`)
        return;
    }else if (inputContent[1].value ==''){
        alert(`請輸入${alertMessage[1].dataset.message}`)
        return;
    }else if (inputContent[2].value ==''){
        alert(`請輸入${alertMessage[2].dataset.message}`)
        return;
    }else if (inputContent[3].value ==''){
        alert(`請輸入${alertMessage[3].dataset.message}`)
        return;
    }else if (inputContent[4].value ==''){
        alert(`請輸入${alertMessage[4].dataset.message}`)
        return;
    }
  
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
              "name": inputContent[0].value,
              "tel": inputContent[1].value,
              "email": inputContent[2].value,
              "address": inputContent[3].value,
              "payment": inputContent[4].value
            }
          }
    }).then(function(response){
        alert('訂單建立成功!')
        getCartList();
    })
    
    //送出訂單後表單reset
    const form = document.querySelector('.orderInfo-form')
    form.reset();
})

