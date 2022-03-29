//função da pagina principal


function main(){

    // --------------------- Variaveis globais

    var btnLogar = document.querySelector(".btn-logar")
    var modalLogar = document.querySelector(".criarModalLogar")
    var modalCadastrar = document.querySelector(".criarModalCadastrar")
    var formModalLogar = document.querySelector(".criarModalLogar .modalLogar .formLogar")
    var closeModalLogar = document.querySelector(".criarModalLogar .modalLogar .closeModalLogar")
    var btnModalCadastrar = document.querySelector(".criarModalLogar .modalLogar .formLogar h3")
    var closeModalCadastrar = document.querySelector(".criarModalCadastrar .modalCadastrar h2")
    var formModalCadastrar = document.querySelector(".criarModalCadastrar .modalCadastrar .formCadastrar form")

    // -------------------- Variaveis de utilização 

    // variaveis da login
    var usuario

    // descrição do post
    var text = ""

    //--------------------- Chamando o firebase

    const config = {
        /* Escreva as configs do seu firebase aqui*/
    };

    firebase.initializeApp(config);


    var db = firebase.firestore()
    var storage = firebase.storage();

    // --------------------- Funções de execução separadas

    async function write(elemento){
        const texto = elemento.split(" ")
        text = texto.slice(0,50)
    }

    // --------------------- Sistema de Cadastrar

    btnModalCadastrar.addEventListener("click",(e)=>{
        modalLogar.style.display = "none"
        modalCadastrar.style.display = "block"
    })

    closeModalCadastrar.addEventListener("click",(e)=>{
        modalCadastrar.style.display = "none"
    })

    formModalCadastrar.addEventListener("submit",(e)=>{
        e.preventDefault()

        
        let nomeCadastrar = e.target.querySelector("#cadastrarNome").value
        let emailCadastrar = e.target.querySelector("#cadastrarEmail").value
        let senhaCadastrar = e.target.querySelector("#cadastrarSenha").value
        let confirmSenhaCadastrar = e.target.querySelector("#cadastrarComfirmarSenha").value

        if(nomeCadastrar.length <= 0 || emailCadastrar.length <= 0 || senhaCadastrar.length <= 0){
            alert("[ERRO] Por favor, preencha todos os campos")
        }else {
            if(confirmSenhaCadastrar == senhaCadastrar){
                firebase.auth().createUserWithEmailAndPassword(emailCadastrar, senhaCadastrar)
                    .then((userCredential) => {


                        // Variavel Que Guarda As Informações Do Usuario
                        var user = userCredential.user;


                        // Setar o nome do Usuario 
                        user.username = nomeCadastrar
                        user.updateProfile({
                            displayName: nomeCadastrar
                        })

                        // Colocar o Usuario Na Pasta de Usuarios
                        db.collection("users").add({
                            name:nomeCadastrar,
                            email:emailCadastrar,
                            senha:senhaCadastrar,
                            priority:"0"
                        })
                        .then((docRef) => {
                            alert("Usuario cadastrado com sucesso")
                            emailCadastrar = ""
                            nomeCadastrar = ""
                            senhaCadastrar = ""
                            confirmSenhaCadastrar = ""
                            modalCadastrar.style.display = "none"
                        })
                        .catch((error) => {
                            alert(error.message)
                        });
                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        alert(errorMessage)
                    });
            }else{
                alert("[ERRO] A senha está incorreta")
            }
        }

    })

    // --------------------- Sistema de Login

    closeModalLogar.addEventListener("click",(e)=>{
        modalLogar.style.display = "none"
    })

    btnLogar.addEventListener("click",(e)=>{
        if(usuario == null){
            modalLogar.style.display = "block"
        }else{
            firebase.auth().signOut().then((val)=>{            
                usuario = null 
                btnLogar.style.backgroundColor = "rgb(121, 121, 121)"
                btnLogar.innerText = "Logar"
            })
        }
    })

    formModalLogar.addEventListener("submit",(e)=>{
        e.preventDefault()

        let email = e.target.querySelector("#logarEmail").value
        let senha = e.target.querySelector("#logarSenha").value


        firebase.auth().signInWithEmailAndPassword(email, senha)
                .then((userCredential) => {
                    // Signed in
                    var user = userCredential.user;
                    usuario = user
                    modalLogar.style.display = "none"
                    btnLogar.style.backgroundColor ="red"
                    btnLogar.innerText = "Sair"
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    alert(errorMessage)
                });
    })

    // --------------------- Sistema de Categorias

    db.collection("Category").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let categoriaBox = document.querySelector(".main .infos .categorias .categorys ul")

                categoriaBox.innerHTML += `
                    <li><i class="fa-solid fa-chevron-right"></i><a href="#">${doc.data().name}</a></li>
                `
            });
        })
        .catch((err)=>{
            console.log(err.message)
        })

    // --------------------- Sistema de Posts

    db.collection("Posts").get()
        .then((querySnapshot) =>{
            querySnapshot.forEach((doc)=>{
                let postsBox = document.querySelector(".noticias-area .noticias")

                let descricao = doc.data().desc

                write(descricao)
                let desc2 = ""

                for(var i = 0; i < text.length; i++){
                    desc2 += (text[i] +" ")
                }

                db.collection("clickInfos").get()
                            .then((querySnapshot)=>{
                                querySnapshot.forEach((doc)=>{
                                    db.collection("clickInfos").doc(doc.id).delete()    
                                        .then(()=>{
                                            console.log("Deletado")
                                        })   
                                        .catch((err)=>{
                                            console.log(err.message)
                                        })
                                })
                            })
                            .catch((err)=>{
                                console.log(err.message)
                                console.log(err.code)
                            })

                postsBox.innerHTML += `
                    <div class="noticia-single" titulo="${doc.data().titulo}" thumb="${doc.data().thumb}" desc="${doc.data().desc}" docId="${doc.id}">
                        <div class="img-noticia">
                            <img src="${doc.data().thumb}">
                        </div>
                        <div class="informacoes-noticia">
                            <h2><a href="#">${doc.data().titulo}</a></h2>
                            <p>${desc2}...</p>
                        </div>
                    </div>
                `

                let noticiaBox = document.querySelectorAll(".noticias-area .noticias .noticia-single")

                for(var u = 0; u < noticiaBox.length; u++){
                    noticiaBox[u].addEventListener("click",(e)=>{


                        let tituloInfo = e.target.parentNode.getAttribute("titulo")
                        let thumbInfo = e.target.parentNode.getAttribute("thumb")
                        let descInfo = e.target.parentNode.getAttribute("desc")
                        let docId = e.target.parentNode.getAttribute("docId")
                        

                        db.collection(`clickInfos`).add({
                            titulo:tituloInfo,
                            thumb:thumbInfo,
                            desc:descInfo,
                            id:docId
                        })
                        .then(()=>{
                            console.log("Criado ")
                            window.location.href = "infoNoticias.html"
                        })
                        
                    })
                }
            })
        })
        .catch((err)=>{
            console.log(err.message)
        })
}

function infoNoticia(){
    //--------------------- Chamando o firebase

    const config = {
        /* Escreva as configs do seu firebase */
    };

    firebase.initializeApp(config);


    var db = firebase.firestore()
    var storage = firebase.storage();



    // --------------------- Gerar as informações
    db.collection("clickInfos").get()
        .then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
                let imgInfoNoticia = document.querySelector(".noticias-area .img-noticia-infos img")
                let tituloInfoNoticia = document.querySelector(".noticias-area .infos-noticia h2")
                let textoInfoNoticia = document.querySelector(".noticias-area .infos-noticia p")

                imgInfoNoticia.src = doc.data().thumb
                tituloInfoNoticia.innerText = `${doc.data().titulo}`
                textoInfoNoticia.innerText = `${doc.data().desc}`
            })
        })


        db.collection("Category").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let categoriaBox = document.querySelector(".main .infos .categorias .categorys ul")

                categoriaBox.innerHTML += `
                    <li><i class="fa-solid fa-chevron-right"></i><a href="#">${doc.data().name}</a></li>
                `
            });
        })
        .catch((err)=>{
            console.log(err.message)
        })
}