// 預設 JS，請同學不要修改此處
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
})

function menuToggle() {
    if(menu.classList.contains('openMenu')) {
        menu.classList.remove('openMenu');
    }else {
        menu.classList.add('openMenu');
    }
}
function closeMenu() {
    menu.classList.remove('openMenu');
}


//後台內容
let orderData=[];
const orderList = document.querySelector('.js-orderList')

//初始化
function init(){
    getOrderList()
}
init()

function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "headers" : {
            Authorization: token,
        }
    })
    .then(res=>{
        orderData=res.data.orders
        renderOrderList()
    })
}

function renderC3(){

    //物件資料蒐集
    let total={}
    orderData.forEach(item=>{
        item.products.forEach(productItem=>{
            if(total[productItem.category] == undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            }else{
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
        console.log(total)

        //做出資料關聯
        let categoryAry=Object.keys(total)
        // console.log(categoryAry)
        let c3Data=[]
        categoryAry.forEach(item=>{
            let ary=[item,total[item]]
            c3Data.push(ary)
        })
        console.log(c3Data)
       


        // C3.js
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: c3Data,
        colors:{
            床架 : "#DACBFF",
            收納 : "#9D7FEA",
            窗簾: "#5434A7",
            // "其他": "#301E5F",
        }
    },
});
    })
}

function renderOrderList(){
 
    let str=''
    orderData.forEach(item=>{

        //組訂單字串
        let productStr='';
        item.products.forEach(productItem=>{
            productStr+=`<p>${productItem.title} x ${productItem.quantity}</p>`
        })

        //判斷訂單處理狀態
        let orderState = ''
        if(item.paid === false){
            orderState = "未處理";
        }else{
            orderState = "已處理"
        }

        //訂單日期轉換，組時間字串
        //createdAt須為13碼，所以後面要*1000
        let timeStamp = new Date(item.createdAt * 1000)
        // console.log(timeStamp)
        let timeStampStr=''

        let year = timeStamp.getFullYear()
        let month = timeStamp.getMonth()
        let day = timeStamp.getDate()

        timeStampStr+=`<p>${year}/${month}/${day}</p>`

        //渲染訂單列表   
        str += `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${productStr}
        </td>
        <td>${timeStampStr}</td>
        <td class="js-orderState">
          <a href="#" class="orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderState}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
        </td>
    </tr>`
    })
    orderList.innerHTML=str;
    renderC3();
}

orderList.addEventListener('click',e=>{
    e.preventDefault();
    const targetClass = e.target.getAttribute('class');
    let id = e.target.getAttribute("data-id")

    if(targetClass == "orderStatus"){
        let status = e.target.getAttribute("data-status")
        editOrderItem(status,id)
    }

    if(targetClass == "delSingleOrder-Btn js-orderDelete"){
        deleteOrderItem(id)
    }
})

//修改訂單狀態
function editOrderItem(status,id){
    console.log(status,id)
    let newStatus;
    if(status==true){
        newStatus=false 
    }else{
        newStatus=true
    }

    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
        "data": {
            "id": id,
            "paid": newStatus
          }
        },
        {
        "headers" : {
            Authorization: token,
        }
    })
    .then(res=>{
        alert(`修改訂單成功!`)
        getOrderList();
    })
}

function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        "headers" : {
            Authorization: token,
        }
    })
    .then(res=>{
        alert(`刪除該筆訂單成功!`)
        getOrderList();
    })
}

const discardBtn = document.querySelector('.discardAllBtn')
discardBtn.addEventListener('click',e=>{
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "headers" : {
            Authorization: token,
        }
    })
    .then(res=>{
        alert(`刪除全部訂單成功!`)
        getOrderList();
    })
})

