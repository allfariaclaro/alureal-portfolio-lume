window.LUME_DATA={
  restaurant:{
    name:"LUME",
    rating:4.9,
    reviews:2384,
    eta:"25–35 min",
    deliveryFee:6.9,
    minOrder:25,
    address:"Jardins · São Paulo",
    openUntil:"23:30"
  },
  categories:[
    {id:"destaques",label:"Destaques"},
    {id:"combos",label:"Combos"},
    {id:"pratos",label:"Pratos"},
    {id:"massas",label:"Massas"},
    {id:"sanduiches",label:"Sanduíches"},
    {id:"entradas",label:"Entradas"},
    {id:"sobremesas",label:"Sobremesas"},
    {id:"bebidas",label:"Bebidas"}
  ],
  products:[
    {
      id:"combo-lume-2",
      category:"combos",
      name:"Combo LUME para 2",
      description:"Burger LUME, croquetes de costela, batatas rústicas e 2 sodas artesanais.",
      price:89.9,oldPrice:104.8,rating:4.9,reviews:318,
      image:"https://images.unsplash.com/photo-1761315412811-4525e421e00b?auto=format&fit=crop&w=1200&q=82",
      badges:["-14%","Mais pedido"],
      tags:["serve 2"],
      options:[
        {title:"Escolha as bebidas",required:true,max:2,items:[
          {name:"Soda de caju",price:0},{name:"Soda de limão",price:0},{name:"Água com gás",price:0}
        ]}
      ]
    },
    {
      id:"executivo-bowl",
      category:"combos",
      name:"Executivo LUME",
      description:"Bowl de frango cítrico, soda artesanal e sobremesa do dia.",
      price:54.9,oldPrice:61.9,rating:4.8,reviews:241,
      image:"https://images.unsplash.com/photo-1744444202869-54debf97b285?auto=format&fit=crop&w=1200&q=82",
      badges:["Almoço"],
      tags:["completo"]
    },
    {
      id:"salmao-miso",
      category:"pratos",
      name:"Salmão, missô e cítricos",
      description:"Salmão grelhado, glaze de missô, arroz de coco, ervas frescas e limão.",
      price:68.9,rating:4.9,reviews:186,
      image:"https://images.unsplash.com/photo-1739785938093-c2b6befeca2f?auto=format&fit=crop&w=1200&q=82",
      badges:["Chef recomenda"],
      tags:["sem glúten"],
      options:[
        {title:"Ponto do salmão",required:true,max:1,items:[
          {name:"Ao ponto",price:0},{name:"Bem passado",price:0}
        ]},
        {title:"Adicionais",required:false,max:3,items:[
          {name:"Arroz de coco extra",price:9.9},{name:"Legumes grelhados",price:12.9},{name:"Molho missô extra",price:4.9}
        ]}
      ]
    },
    {
      id:"bowl-frango",
      category:"pratos",
      name:"Bowl de frango cítrico",
      description:"Frango grelhado, arroz, pepino, cenoura, folhas, gergelim e molho cítrico da casa.",
      price:42.9,rating:4.8,reviews:409,
      image:"https://images.unsplash.com/photo-1744444202869-54debf97b285?auto=format&fit=crop&w=1200&q=82",
      badges:["Mais pedido"],
      tags:["leve"]
    },
    {
      id:"massa-trufada",
      category:"massas",
      name:"Massa fresca trufada",
      description:"Massa artesanal, creme de parmesão, cogumelos tostados e azeite trufado.",
      price:49.9,rating:4.9,reviews:267,
      image:"https://images.unsplash.com/photo-1754008365983-439d161c72a7?auto=format&fit=crop&w=1200&q=82",
      badges:["Vegetariano"],
      tags:["massa fresca"]
    },
    {
      id:"massa-ragu",
      category:"massas",
      name:"Rigatoni de ragu",
      description:"Rigatoni, ragu cozido lentamente, tomate assado, parmesão e ervas.",
      price:47.9,rating:4.8,reviews:193,
      image:"https://images.unsplash.com/photo-1754008365983-439d161c72a7?auto=format&fit=crop&w=1200&q=82",
      badges:[],
      tags:["comfort food"]
    },
    {
      id:"burger-lume",
      category:"sanduiches",
      name:"Burger LUME",
      description:"Blend 180 g, queijo meia-cura, cebola tostada, picles, maionese de ervas e brioche.",
      price:39.9,rating:4.9,reviews:522,
      image:"https://images.unsplash.com/photo-1761315412811-4525e421e00b?auto=format&fit=crop&w=1200&q=82",
      badges:["Mais pedido"],
      tags:["acompanha fritas"],
      options:[
        {title:"Ponto da carne",required:true,max:1,items:[
          {name:"Ao ponto",price:0},{name:"Bem passado",price:0}
        ]},
        {title:"Extras",required:false,max:3,items:[
          {name:"Queijo extra",price:5.9},{name:"Bacon crocante",price:7.9},{name:"Ovo",price:4.9}
        ]}
      ]
    },
    {
      id:"croquete-costela",
      category:"entradas",
      name:"Croquete de costela",
      description:"6 unidades, costela desfiada, queijo curado e mostarda fermentada.",
      price:31.9,rating:4.8,reviews:355,
      image:"https://images.unsplash.com/photo-1713517915303-ae3b3429f939?auto=format&fit=crop&w=1200&q=82",
      badges:["Para compartilhar"],
      tags:["6 un."]
    },
    {
      id:"brownie-cacau",
      category:"sobremesas",
      name:"Brownie de cacau 70%",
      description:"Brownie intenso, creme de baunilha, caramelo salgado e frutas vermelhas.",
      price:24.9,rating:4.9,reviews:291,
      image:"https://images.unsplash.com/photo-1693346300688-064e286c8482?auto=format&fit=crop&w=1200&q=82",
      badges:["Favorito"],
      tags:["doce"]
    },
    {
      id:"mousse-chocolate",
      category:"sobremesas",
      name:"Mousse de chocolate e café",
      description:"Chocolate 70%, café, flor de sal e crocante de castanhas.",
      price:22.9,rating:4.8,reviews:173,
      image:"https://images.unsplash.com/photo-1693346300688-064e286c8482?auto=format&fit=crop&w=1200&q=82",
      badges:[],
      tags:["gelado"]
    },
    {
      id:"caipirinha-lume",
      category:"bebidas",
      name:"Caipirinha LUME",
      description:"Cachaça, limão-taiti, açúcar demerara e gelo. 300 ml.",
      price:27.9,rating:4.9,reviews:212,
      image:"https://images.unsplash.com/photo-1763544161335-a21daf50d0a2?auto=format&fit=crop&w=1200&q=82",
      badges:["18+"],
      tags:["alcoólico"]
    },
    {
      id:"soda-caju",
      category:"bebidas",
      name:"Soda artesanal de caju",
      description:"Caju, limão, especiarias e água com gás. 350 ml.",
      price:13.9,rating:4.7,reviews:164,
      image:"https://images.unsplash.com/photo-1763544161335-a21daf50d0a2?auto=format&fit=crop&w=1200&q=82",
      badges:["Sem álcool"],
      tags:["350 ml"]
    }
  ],
  reviews:[
    {name:"Marina S.",rating:5,date:"há 2 dias",text:"Chegou quente, embalagem muito bem pensada e o salmão estava excelente.",order:"Salmão, missô e cítricos"},
    {name:"Lucas M.",rating:5,date:"há 5 dias",text:"Burger muito bom e batata chegou crocante. Pedi de novo na mesma semana.",order:"Burger LUME"},
    {name:"Camila R.",rating:5,date:"há 1 semana",text:"O combo para dois vale muito a pena. Sobremesa excelente também.",order:"Combo LUME para 2"},
    {name:"Renato P.",rating:4,date:"há 1 semana",text:"Entrega dentro do prazo e massa ótima. Só pediria mais molho da próxima vez.",order:"Massa fresca trufada"},
    {name:"Ana T.",rating:5,date:"há 2 semanas",text:"A soda de caju surpreendeu. Tudo com cara de restaurante, não de fast-food.",order:"Executivo LUME"}
  ]
};