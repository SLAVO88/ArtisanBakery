

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
  
    
}

function ready(){

    loadCart()
    
        
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

let stripeHendler = StripeCheckout.configure({
    key:stripePublicKey,
    locale: 'auto',
    token: function(token){
        var items = []
        var cartItemContainer = document.getElementsByClassName('cart-items')[0]
        var cartRows = cartItemContainer.getElementsByClassName('cart-row')
        for (i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var quantity = quantityElement.value
        var id = cartRow.dataset.itemId
        items.push({
            id:id,
            quantity:quantity,
        })
        
        }
        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.Id,
                items: items
            }).then(function(res){
                return res.json()
                }).then(function(data) {
                alert(data.message)
                var cartItems = document.getElementsByClassName('cart-items')[0]
                while (cartItems.hasChildNodes()) {
                cartItems.removeChild(cartItems.firstChild)
                }
                updateCartTotal()
                usersCart()
                }).catch(function(error){
                    console.error(error)
                    })
            })
    } 
})
    


function purchaseClicked() {
    
    let priceElement = document.getElementsByClassName('cart-total-price')[0]
    let price = parseFloat(priceElement.innerText.replace('£', '')) * 100
    stripeHendler.open({
        amount: price
    })
  
}

function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
    usersCart()
}

function addItemToCart(title, price, imageSrc, id, quantity=1) {
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    cartRow.dataset.itemId = id
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart')
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="${quantity}">
            <button class="btn btn-danger" type="button">Remove</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}


function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal()
    usersCart()
}

function addToCartClicked(event) {
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    var id = shopItem.dataset.itemId
    
   
    
 
     addItemToCart(title, price, imageSrc, id, "1")
     usersCart()
   
    updateCartTotal()
    
}


function usersCart(){
    
    var items = []
    var cartQuantity = ""
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    for (i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i]
    var title = cartRow.getElementsByClassName('cart-item-title')[0].innerText
    var price = cartRow.getElementsByClassName('cart-price')[0].innerText
    var imageSrc = cartRow.getElementsByClassName('cart-item-image')[0].src
    var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
    var quantity = quantityElement.value
    cartQuantity = i + 1
    var id = cartRow.dataset.itemId
    items.push({
        productId: id,
        quantity: quantity,
        title: title,
        price: price,
        imageSrc: imageSrc
    })
    }

    
    
    fetch('/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Accept': 'application/json'
        },
        body: JSON.stringify({
            items: items, cartQuantity: cartQuantity

        })
        }).then(res => {
            return res.json()
        }).then(data => {
            var cartItems = document.getElementsByClassName('cart-items')[0]
            while (cartItems.hasChildNodes()) {
                cartItems.removeChild(cartItems.firstChild)
            }   
            data.items.forEach(function(item){
                
                addItemToCart(item.title, item.price, item.imageSrc, item.productId, item.quantity)
                
            })  
            document.getElementsByClassName('badge')[0].innerText = cartQuantity 
        }
        ).catch(function(error){
            console.error(error)
            })
        

}

function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('£', ''))
        var quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '£' + total
}

function loadCart() {
    fetch('/loadcart')
    .then(res => {
        if (res.ok){
            console.log("success")
        } else {
            console.log("not successful")
        }
        return res.json()
    }).then(data => {
        var cartItems = document.getElementsByClassName('cart-items')[0]
        while (cartItems.hasChildNodes()) {
            cartItems.removeChild(cartItems.firstChild)
        } 
        if (data.items){
            data.items.forEach(function(item){
                
                addItemToCart(item.title, item.price, item.imageSrc, item.productId, item.quantity)
                
            })  
            updateCartTotal()
        } else {
            console.log('empty')
        }
        
    }
    ).catch(function(error){
        console.error(error)
        })


}