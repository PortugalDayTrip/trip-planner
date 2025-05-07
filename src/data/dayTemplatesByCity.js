// Day itinerary templates for each city. Expand as needed.
export const dayTemplatesByCity = {
  Lisbon: [
    {
      label: "Cultural Lisbon",
      city: "Lisbon",
      slots: {
        morning: [{ title: "Belém Tower", desc: "Iconic riverside fortress.", lat: 38.6916, lng: -9.2166 }],
        lunch: [{ title: "Time Out Market", desc: "Trendy food court.", lat: 38.7083, lng: -9.1600 }],
        afternoon: [{ title: "Jerónimos Monastery", desc: "UNESCO heritage site.", lat: 38.6971, lng: -9.2065 }],
        dinner: [{ title: "Cervejaria Ramiro", desc: "Famous seafood restaurant.", lat: 38.7170, lng: -9.1481 }],
        evening: [{ title: "Miradouro da Graça", desc: "Panoramic city views.", lat: 38.7145, lng: -9.1352 }]
      }
    },
    {
      label: "Historic Lisbon",
      city: "Lisbon",
      slots: {
        morning: [{ title: "São Jorge Castle", desc: "Medieval hilltop castle.", lat: 38.7139, lng: -9.1335 }],
        lunch: [{ title: "Alfama District", desc: "Traditional fado quarter.", lat: 38.7139, lng: -9.1256 }],
        afternoon: [{ title: "Tram 28 Ride", desc: "Historic tram through city.", lat: 38.7173, lng: -9.1339 }],
        dinner: [{ title: "Pharmacia Restaurant", desc: "Creative dishes in pharmacy decor.", lat: 38.7137, lng: -9.1410 }],
        evening: [{ title: "Bairro Alto", desc: "Nightlife district.", lat: 38.7135, lng: -9.1447 }]
      }
    },
    {
      label: "Modern Lisbon",
      city: "Lisbon",
      slots: {
        morning: [{ title: "Parque das Nações", desc: "Contemporary waterfront area.", lat: 38.7636, lng: -9.0959 }],
        lunch: [{ title: "Vasco da Gama Shopping", desc: "Mall with river views.", lat: 38.7647, lng: -9.0950 }],
        afternoon: [{ title: "Oceanário de Lisboa", desc: "World-class aquarium.", lat: 38.7638, lng: -9.0970 }],
        dinner: [{ title: "Maior Restaurante", desc: "Upscale dining by Tagus.", lat: 38.7630, lng: -9.0945 }],
        evening: [{ title: "Casino Lisboa", desc: "Riverfront casino and shows.", lat: 38.7640, lng: -9.0975 }]
      }
    }
  ],
  Porto: [
    {
      label: "Riverside Porto",
      city: "Porto",
      slots: {
        morning: [{ title: "Ribeira Square", desc: "Colorful riverside plaza.", lat: 41.1400, lng: -8.6115 }],
        lunch: [{ title: "Cais de Gaia", desc: "Port wine tasting.", lat: 41.1381, lng: -8.6129 }],
        afternoon: [{ title: "Dom Luís I Bridge", desc: "Iconic double-deck bridge.", lat: 41.1405, lng: -8.6110 }],
        dinner: [{ title: "Brasão Coliseu", desc: "Legendary francesinha.", lat: 41.1490, lng: -8.6105 }],
        evening: [{ title: "Gaia Cable Car", desc: "Sunset city panorama.", lat: 41.1385, lng: -8.6125 }]
      }
    },
    {
      label: "Historic Porto",
      city: "Porto",
      slots: {
        morning: [{ title: "Livraria Lello", desc: "Gothic bookstore.", lat: 41.1466, lng: -8.6147 }],
        lunch: [{ title: "Mercado do Bolhão", desc: "Traditional market.", lat: 41.1460, lng: -8.6100 }],
        afternoon: [{ title: "Clérigos Tower", desc: "Baroque bell tower.", lat: 41.1456, lng: -8.6139 }],
        dinner: [{ title: "Cantinho do Avillez", desc: "Modern Portuguese.", lat: 41.1450, lng: -8.6150 }],
        evening: [{ title: "Rua Galerias de Paris", desc: "Bar street.", lat: 41.1455, lng: -8.6090 }]
      }
    },
    {
      label: "Artistic Porto",
      city: "Porto",
      slots: {
        morning: [{ title: "Serralves Museum", desc: "Contemporary art.", lat: 41.1693, lng: -8.6420 }],
        lunch: [{ title: "Casa da Música", desc: "Concert hall café.", lat: 41.1616, lng: -8.6300 }],
        afternoon: [{ title: "Crystal Palace Gardens", desc: "Scenic gardens.", lat: 41.1535, lng: -8.6108 }],
        dinner: [{ title: "O Gaveto", desc: "Seafood excellence.", lat: 41.1340, lng: -8.6700 }],
        evening: [{ title: "Foz do Douro", desc: "Seaside promenade.", lat: 41.1383, lng: -8.7031 }]
      }
    }
  ],
  Faro: [
    {
      label: "Historic Faro",
      city: "Faro",
      slots: {
        morning: [{ title: "Old Town Faro", desc: "Cobblestone streets.", lat: 37.0147, lng: -7.9350 }],
        lunch: [{ title: "Vila Adentro", desc: "Algarve specialties.", lat: 37.0144, lng: -7.9322 }],
        afternoon: [{ title: "Praia de Faro", desc: "Beach relaxation.", lat: 36.9924, lng: -7.8509 }],
        dinner: [{ title: "Faaron Steakhouse", desc: "Hearty steaks.", lat: 37.0180, lng: -7.9355 }],
        evening: [{ title: "Bar CheSsenta", desc: "Live music.", lat: 37.0155, lng: -7.9320 }]
      }
    },
    {
      label: "Nature Faro",
      city: "Faro",
      slots: {
        morning: [{ title: "Ria Formosa Tour", desc: "Lagoon islands.", lat: 36.9978, lng: -7.8205 }],
        lunch: [{ title: "Marisqueira Foz", desc: "Seafood by lagoon.", lat: 36.9980, lng: -7.8210 }],
        afternoon: [{ title: "Ilha Deserta", desc: "Remote beach.", lat: 36.9995, lng: -7.8510 }],
        dinner: [{ title: "Casa do Pescador", desc: "Fresh catch daily.", lat: 37.0200, lng: -7.9400 }],
        evening: [{ title: "Marina Walk", desc: "Evening stroll.", lat: 37.0158, lng: -7.9327 }]
      }
    },
    {
      label: "Cultural Faro",
      city: "Faro",
      slots: {
        morning: [{ title: "Igreja do Carmo", desc: "Baroque church.", lat: 37.0189, lng: -7.9296 }],
        lunch: [{ title: "Portas São Pedro", desc: "Café inside walls.", lat: 37.0175, lng: -7.9305 }],
        afternoon: [{ title: "Fortaleza Santa Catarina", desc: "Coastal fortress.", lat: 37.0132, lng: -7.9290 }],
        dinner: [{ title: "Taco Lounge", desc: "Tapas and cocktails.", lat: 37.0138, lng: -7.9353 }],
        evening: [{ title: "Old Town Walk", desc: "Historic ramparts.", lat: 37.0147, lng: -7.9350 }]
      }
    }
  ],
  Coimbra: [
    {
      label: "Historic Coimbra",
      city: "Coimbra",
      slots: {
        morning: [{ title: "Sé Velha", desc: "Medieval cathedral.", lat: 40.2089, lng: -8.4265 }],
        lunch: [{ title: "Quinta das Lágrimas", desc: "Romantic gardens and café.", lat: 40.2094, lng: -8.4239 }],
        afternoon: [{ title: "Biblioteca Joanina", desc: "Baroque library.", lat: 40.2052, lng: -8.4216 }],
        dinner: [{ title: "Loggia Restaurant", desc: "Panoramic city views.", lat: 40.2050, lng: -8.4197 }],
        evening: [{ title: "Mondego Riverside", desc: "Scenic river walk.", lat: 40.2027, lng: -8.4188 }]
      }
    }
  ],
  Sintra: [
    {
      label: "Magical Sintra",
      city: "Sintra",
      slots: {
        morning: [{ title: "Pena Palace", desc: "Colorful Romanticist palace.", lat: 38.7879, lng: -9.3900 }],
        lunch: [{ title: "Tascantiga", desc: "Local tapas.", lat: 38.7955, lng: -9.3830 }],
        afternoon: [{ title: "Moorish Castle", desc: "Ancient fortress.", lat: 38.7937, lng: -9.3907 }],
        dinner: [{ title: "Tacho Real", desc: "Traditional Portuguese.", lat: 38.7966, lng: -9.3904 }],
        evening: [{ title: "Sintra Historic Center", desc: "Nighttime stroll.", lat: 38.7975, lng: -9.3903 }]
      }
    }
  ],
  Évora: [
    {
      label: "Ancient Évora",
      city: "Évora",
      slots: {
        morning: [{ title: "Temple of Diana", desc: "Roman ruins.", lat: 38.5715, lng: -7.9079 }],
        lunch: [{ title: "Taberna Típica Quarta-feira", desc: "Alentejo specialties.", lat: 38.5718, lng: -7.9075 }],
        afternoon: [{ title: "Chapel of Bones", desc: "Macabre chapel.", lat: 38.5709, lng: -7.9091 }],
        dinner: [{ title: "Fialho", desc: "Classic Portuguese cuisine.", lat: 38.5660, lng: -7.8940 }],
        evening: [{ title: "Praça do Giraldo", desc: "Central square lights.", lat: 38.5726, lng: -7.9050 }]
      }
    }
  ],
  Braga: [
    {
      label: "Spiritual Braga",
      city: "Braga",
      slots: {
        morning: [{ title: "Bom Jesus do Monte", desc: "Scenic baroque sanctuary.", lat: 41.5542, lng: -8.4228 }],
        lunch: [{ title: "A Brasileira", desc: "Historic café.", lat: 41.5548, lng: -8.4217 }],
        afternoon: [{ title: "Braga Cathedral", desc: "Medieval cathedral.", lat: 41.5454, lng: -8.4265 }],
        dinner: [{ title: "Restaurante Tibães", desc: "Traditional flavors.", lat: 41.5645, lng: -8.4177 }],
        evening: [{ title: "Jardim de Santa Bárbara", desc: "Romantic gardens.", lat: 41.5476, lng: -8.4262 }]
      }
    }
  ],
  Aveiro: [
    {
      label: "Canal Aveiro",
      city: "Aveiro",
      slots: {
        morning: [{ title: "Moliceiro Ride", desc: "Colorful boat tour.", lat: 40.6405, lng: -8.6538 }],
        lunch: [{ title: "O Bairro", desc: "Canal-side café.", lat: 40.6400, lng: -8.6530 }],
        afternoon: [{ title: "Costa Nova Beach", desc: "Famous striped houses.", lat: 40.6445, lng: -8.7519 }],
        dinner: [{ title: "Salpoente", desc: "Seafood restaurant.", lat: 40.6409, lng: -8.6480 }],
        evening: [{ title: "Aveiro Channels", desc: "Twilight canal stroll.", lat: 40.6405, lng: -8.6538 }]
      }
    }
  ]
};
