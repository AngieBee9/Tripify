// src/services/DataService.js
const DataService = (() => {
  /* POMOĆNE FUNKCIJE */
  const uniqueTags = (data) => {
    const set = {};
    data.forEach((item) => {
      (item.tags || []).forEach((tag) => (set[tag] = true));
    });
    return Object.keys(set).sort();
  };

  const applyFilters = (data, q) => {
    const t = (q.text || "").toLowerCase();
    let arr = data.filter((item) => {
      const text = (item.naziv + " " + (item.opis || "")).toLowerCase();
      const okText = !t || text.includes(t);
      const okCont = !q.kontinent || item.kontinent === q.kontinent;
      const okTag = !q.tag || (item.tags || []).includes(q.tag);
      const okPrice = q.maxPrice ? item.price <= q.maxPrice : true;
      const okDays = q.minDays ? item.days >= q.minDays : true;

      return okText && okCont && okTag && okPrice && okDays;
    });

    switch (q.sort) {
      case "priceAsc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "daysAsc":
        arr.sort((a, b) => a.days - b.days);
        break;
      case "daysDesc":
        arr.sort((a, b) => b.days - a.days);
        break;
      case "nameAsc":
        arr.sort((a, b) => a.naziv.localeCompare(b.naziv));
        break;
      default:
        break;
    }

    return arr;
  };

  const imageFallback = (e) => {
    e.target.onerror = null;
    e.target.src =
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=70";
  };

  /* PODACI */
  const CONTINENTS = [
    "Europa",
    "Azija",
    "Afrika",
    "Srednja Amerika",
    "Južna Amerika",
    "Oceanija",
  ];

  const DESTINACIJE = [
    {
      slug: "kostarika",
      naziv: "Kostarika",
      opis: "Ekološke ture 🌿",
      opisDug:
        "Kostarika je pionir ekoturizma s više od četvrtine teritorija pod zaštitom. Idealna je za ljubitelje prašuma, vulkana i tihe obale Pacifika.",
      zanimljivosti: [
        "Više od 5% svjetske biodiverzitetne raznolikosti.",
        "Poznata po 'pura vida' životnom stilu.",
        "Topli izvori Arenal i oblaci Monteverde.",
      ],
      slika:
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi289zcRW1_mjzw_VYJ2-8Wx6oR6DIvnOvcyhET5ELOk5WiPs9XR34j6mClCP2BNUP3LwIyLXDA0uPlxYHIWS4OELk_wXiSE1aUz3rHAL29SBZC8N15OVy7tfhrZMfhLRm6xYmKoYeX6XE/s1600/odmor-kostarika-putovanje-more.jpg",
      price: 1290,
      days: 7,
      kontinent: "Sjeverna Amerika",
      tags: ["Popularno", "Priroda", "Održivo"],
      includes: ["Smještaj 6 noći", "Transferi", "2 izleta s vodičem"],
      itinerary: [
        { day: 1, title: "Dolazak u San José", text: "Transfer do hotela i slobodno vrijeme." },
        { day: 2, title: "Arenal & topli izvori", text: "Obilazak parka, večernje kupanje." },
      ],
      gallery: [
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=70",
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1200&q=70",
      ],
      mapQuery: "Costa Rica",
    },
    {
      slug: "skotska",
      naziv: "Škotska",
      opis: "Putovanje vlakom 🏞️",
      opisDug:
        "Škotska nudi dramatične krajolike, dvorce i bogatu tradiciju. Putovanje vlakom pruža sporiji, romantičan način istraživanja Highlands-a.",
      zanimljivosti: [
        "Edinburgh je UNESCO grad književnosti.",
        "Jacobite parna lokomotiva prelazi slavni Glenfinnan viadukt.",
        "Destilerije viskija diljem zemlje.",
      ],
      slika: "https://www.gekko-potovanja.si/wp-content/uploads/2020/04/scotland-540119_1920.jpg",
      price: 890,
      days: 5,
      kontinent: "Europa",
      tags: ["Vlak", "Povijest"],
      includes: ["Vlak karte", "2 ture"],
      itinerary: [{ day: 1, title: "Edinburgh", text: "Stari grad i dvorac." }],
      gallery: [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1471623432079-b009d30b6729?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520975898376-6c2c1a2fd4b3?auto=format&fit=crop&w=1200&q=80",
      ],
      mapQuery: "Edinburgh",
    },
    {
      slug: "madagaskar",
      naziv: "Madagaskar",
      opis: "Očuvanje prirode 🏝️",
      opisDug:
        "Otoku endema: od lemura do baobaba. Putovanja su avanturistička, ali nagrada je netaknuta priroda.",
      zanimljivosti: [
        "90% biljnih vrsta je endemsko.",
        "Avenija baobaba je ikonična ruta.",
        "Nacionalni park Andasibe – dom indri lemura.",
      ],
      slika: "https://uploads.publishwall.si/publishwall_new/walls/100000/129812/2023/08/04/64cd282ee788f.webp",
      price: 1490,
      days: 9,
      kontinent: "Afrika",
      tags: ["Egzotika"],
      includes: ["Smještaj", "Aktivnosti"],
      itinerary: [],
      gallery: [
        "https://images.unsplash.com/photo-1531190560920-184c5a72e22c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560184897-67f4f22d0bbf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518432031352-3e6e2e3a8ad8?auto=format&fit=crop&w=1200&q=80",
      ],
      mapQuery: "Madagascar",
    },
    {
      slug: "nepal",
      naziv: "Nepal",
      opis: "Planinarenje s lokalnim vodičima 🗻",
      opisDug:
        "Među najvišim vrhovima svijeta, Nepal je dom Himalaje. Autentična sela i staze nude jedinstveno iskustvo.",
      zanimljivosti: [
        "Gautama Buddha rođen je u Lumbiniju.",
        "Kathmandu dolina obiluje hramovima.",
        "Trekking rute: Annapurna, Everest Base Camp.",
      ],
      slika: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkgYlZYL88mmmJBMzFRuJ04kbBYHp-dsybWQ&s",
      price: 1150,
      days: 8,
      kontinent: "Azija",
      tags: ["Planine"],
      includes: ["Trek vodič", "Dozvole"],
      itinerary: [],
      gallery: [
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1509644851169-2acc08aa25b2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
      ],
      mapQuery: "Kathmandu",
    },
    {
      slug: "bali",
      naziv: "Bali",
      opis: "Kultura i vulkani 🌋",
      opisDug:
        "Otoku božanstava, riznica hramova, terasa riže i surf valova. Idealno za wellness i slow travel.",
      zanimljivosti: [
        "Hram Tanah Lot na stijeni u moru.",
        "Terasaste rižine poljane Tegallalang.",
        "Tradicionalne plesne predstave u Ubudu.",
      ],
      slika: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      price: 980,
      days: 6,
      kontinent: "Azija",
      tags: ["Wellness", "Kultura"],
      includes: ["Smještaj", "Aktivnosti"],
      itinerary: [],
      gallery: [
        "https://images.unsplash.com/photo-1546484959-f9a53db89c37?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518544801976-3e188948ac00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1200&q=80",
      ],
      mapQuery: "Bali",
    },
    {
      slug: "cinque-terre",
      naziv: "Cinque Terre",
      opis: "Talijanska obala i vino 🍷",
      opisDug:
        "Pet šarenih sela na liticama iznad Ligurskog mora povezanih stazama i vlakom.",
      zanimljivosti: [
        "Staza Sentiero Azzurro povezuje sela.",
        "Poznati pesto Genovese i bijela vina.",
        "UNESCO zaštićena područja.",
      ],
      slika: "https://www.svjetskiputnik.hr/wp-content/uploads/italija-cinque-terre-480x430-1.jpg",
      price: 620,
      days: 4,
      kontinent: "Europa",
      tags: ["Obala"],
      includes: ["Brodica", "Degustacija"],
      itinerary: [],
      gallery: [
        "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80",
      ],
      mapQuery: "Cinque Terre",
    },
    {
      slug: "patagonija",
      naziv: "Patagonija",
      opis: "Ledeni krajolici i planine",
      opisDug:
        "Divlja regija Argentine i Čilea s glečerima, vjetrovima i legendarnim stazama.",
      zanimljivosti: [
        "Perito Moreno – glečer koji napreduje.",
        "Torres del Paine – simbol Patagonije.",
        "Vjetar je gotovo stalno prisutan.",
      ],
      slika: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRcktpJz74LRkQ_gS7PlKlCrvhrdTKJv2C2g&s",
      price: 1890,
      days: 10,
      kontinent: "Južna Amerika",
      tags: ["Avantura", "Hladno"],
      includes: ["Trek", "Lokalni vodič"],
      itinerary: [],
      gallery: [
        "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1526400423593-6c5b0bd4b9a5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1544989164-31dc3c645987?auto=format&fit=crop&w=1200&q=80",
      ],
      mapQuery: "Patagonia",
    },
    {
      slug: "santorini",
      naziv: "Santorini",
      opis: "Romantične ture i zalasci sunca 🌅",
      opisDug:
        "Kikladski dragulj s bijelim kućama i plavim kupolama, spektakularni zalasci u Oii.",
      zanimljivosti: [
        "Nastao na rubu kaldere.",
        "Vina od sorte Assyrtiko.",
        "Crna i crvena plaža.",
      ],
      slika: "https://chilitours.hr/upload/santorini_ljetovanje_chilitours_1ngLTm2C8w.jpg",
      price: 740,
      days: 5,
      kontinent: "Europa",
      tags: ["Za parove"],
      includes: ["Hotel", "Vinska tura"],
      itinerary: [],
      gallery: [
        "https://images.unsplash.com/photo-1504270997636-07ddfbd48945?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1500739864400-449b6e5dd268?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
      ],
      mapQuery: "Santorini",
    },
    {
      slug: "island",
      naziv: "Island",
      opis: "Aurora borealis i ledene špilje",
      opisDug:
        "Zemlja vatre i leda: gejziri, vodopadi i vulkani na dohvat ruke, Ring Road izlet.",
      zanimljivosti: [
        "Blue Lagoon i Golden Circle.",
        "Aurora zimi, ponoćno sunce ljeti.",
        "Sigurna i dobro označena cestovna mreža.",
      ],
      slika: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=800&q=80",
      price: 1320,
      days: 7,
      kontinent: "Europa",
      tags: ["Priroda", "Nordijsko"],
      includes: ["Najam auta", "Itinerar"],
      itinerary: [],
      gallery: [
        "https://images.unsplash.com/photo-1445264618000-f1e069c592e8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=80",
      ],
      mapQuery: "Iceland",
    },
  ];

  const TURE = [
  {
    slug: "ande-eko",
    naziv: "Tura kroz Ande",
    opis: "5 dana s lokalnim vodičem",
    opisDug:
      "Fokus na lokalne zajednice i održive rute kroz Ande uz spore prijelaze i panoramske poglede.",
    zanimljivosti: [
      "Ande su najdulji planinski lanac na svijetu.",
      "Velike visine zahtijevaju aklimatizaciju.",
      "Bogata andska kuhinja (quinoa, kukuruz).",
    ],
    slika:
      "https://media.istockphoto.com/id/1127785895/photo/the-yeso-reservoir.jpg?s=612x612&w=0&k=20&c=iLa63FylmhkCq_Gpi7MDvV14p54nywYE5p8bPR-swmQ=",
    price: 920,
    days: 5,
    kontinent: "Južna Amerika",
    tags: ["Planine", "Lokalno"],
    includes: ["Smještaj 4 noći", "Doručak", "Vodič"],
    itinerary: [{ day: 1, title: "Santiago", text: "Upoznavanje grupe." }],
    gallery: [
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542144582-1ba00456b5aa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
    ],
    mapQuery: "Andes",
  },
  {
    slug: "tanzanija-safari",
    naziv: "Safari u Tanzaniji",
    opis: "Očuvanje divljih životinja",
    opisDug:
      "Kroz Serengeti i Ngorongoro s certificiranim vodičima. Naglasak na promatranju bez uznemiravanja životinja.",
    zanimljivosti: [
      "Velika migracija gnuova.",
      "Zaštićena područja i rangeri.",
      "Etički kodeks promatranja faune.",
    ],
    slika:
      "https://www.integral-zagreb.hr/sites/default/files/styles/1920_auto_/public/uploads/products/gallery/2024-06/tanzanija-safari-3.jpg?itok=-tvcmYJN",
    price: 1680,
    days: 7,
    kontinent: "Afrika",
    tags: ["Safari", "Divljina"],
    includes: ["Jeep tura", "Vodič", "Kamp"],
    itinerary: [{ day: 2, title: "Serengeti", text: "Safari u parku." }],
    gallery: [
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1200&q=80",
    ],
    mapQuery: "Serengeti",
  },
  {
    slug: "norveska-kajak",
    naziv: "Kajakom kroz Norvešku",
    opis: "Tiho istraživanje fjordova",
    opisDug:
      "Fjordovi, vodopadi i tihi zaljevi – idealno za ljubitelje prirode i fotografije.",
    zanimljivosti: [
      "Norveški fjordovi su ledenjačkog podrijetla.",
      "Puffini i tuljani ponekad uočljivi.",
      "Noćno svjetlo ljeti traje dugo.",
    ],
    slika:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5lWpzwNTaLFXQl7mZdcmHF0tQFJ7JuGhaPg&s",
    price: 790,
    days: 4,
    kontinent: "Europa",
    tags: ["Voda", "Tišina"],
    includes: ["Kajak oprema", "Vodič"],
    itinerary: [],
    gallery: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&w=1200&q=80",
    ],
    mapQuery: "Norway fjords",
  },
  {
    slug: "kapadokija-baloni",
    naziv: "Baloni u Kapadokiji",
    opis: "Let iznad bajkovitih stijena",
    opisDug:
      "Jedinstven pejzaž vulkanskih formacija, jutarnji let balonom i posjet podzemnim gradovima.",
    zanimljivosti: [
      "Zore su najstabilnije za let.",
      "'Vilinske dimnjake' oblikovala je erozija.",
      "Derinkuyu – višekatni podzemni grad.",
    ],
    slika:
      "https://th.bing.com/th/id/R.636af8f54a7064ca5bf4fda65db1dcf0?rik=h54Z0SKn8YC8tg&riu=http%3a%2f%2ffotozine.org%2ffotka.php%3fm%3dg%26p%3d4459%2f01-20221207_075741--3_ok_1200___290.jpg&ehk=StmUGW4Ss6dYWPudElL%2b8hnvUTnNkryrQDG8mfjtW7U%3d&risl=&pid=ImgRaw&r=0",
    price: 350,
    days: 2,
    kontinent: "Azija",
    tags: ["Panorama", "Baloni"],
    includes: ["Let balonom", "Doručak"],
    itinerary: [],
    gallery: [
      "https://images.unsplash.com/photo-1544739313-61605251e8c5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544739313-6f32d0a480d4?auto=format&fit=crop&w=1200&q=80",
    ],
    mapQuery: "Cappadocia",
  },
  {
    slug: "island-hiking",
    naziv: "Pješačenje Islandom",
    opis: "Vodopadi i geotermalna čuda",
    opisDug:
      "Kombinacija slapova, lavinih polja i prirodnih kupališta, uz siguran plan kretanja.",
    zanimljivosti: [
      "Vatnajökull – najveći europski ledenjak.",
      "Kerlingarfjöll geotermalni krajolici.",
      "Jaka sigurnosna kultura planinarenja.",
    ],
    slika: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    price: 1120,
    days: 6,
    kontinent: "Europa",
    tags: ["Hiking"],
    includes: ["Plan puta", "Smještaj"],
    itinerary: [],
    gallery: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
    ],
    mapQuery: "Iceland waterfalls",
  },
  {
    slug: "galapagos-brod",
    naziv: "Plovidba Galapagosom",
    opis: "Susret s jedinstvenim vrstama",
    opisDug:
      "Otočje koje je nadahnulo Darwina – strogi propisi čuvaju jedinstveni ekosustav.",
    zanimljivosti: [
      "Morske iguane i divovske kornjače.",
      "Ograničen broj posjetitelja po otoku.",
      "Vodiči s licencom Nacionalnog parka.",
    ],
    slika: "https://img.rtvslo.si/_up/upload/2010/04/22/64684313_galapagos-20tortoises_slideshow_604x500.jpg",
    price: 2450,
    days: 8,
    kontinent: "Južna Amerika",
    tags: ["Brod", "Fauna"],
    includes: ["Kabina", "Vodič prirodoslovac"],
    itinerary: [],
    gallery: [
      "https://images.unsplash.com/photo-1525151498231-bc059cfafa1b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80",
    ],
    mapQuery: "Galapagos",
  },
  {
    slug: "namibija-kamp",
    naziv: "Kampiranje u Namibiji",
    opis: "Zvjezdano nebo i crvene dine",
    opisDug:
      "Pustinjski pejzaži, tihi kampovi i izvanredna noćna nebesa bez svjetlosnog zagađenja.",
    zanimljivosti: [
      "Deadvlei – bijele glinene plohe i crna stabla.",
      "Dine Sossusvlei među najvišima.",
      "Astrofotografija je fantastična.",
    ],
    slika: "https://www.thisiscolossal.com/wp-content/uploads/2018/10/Namibia-20161017-CF002835-0110.jpg",
    price: 890,
    days: 5,
    kontinent: "Afrika",
    tags: ["Pustinja", "Zvjezdano nebo"],
    includes: ["Šator", "Kamp oprema"],
    itinerary: [],
    gallery: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    ],
    mapQuery: "Namibia dunes",
  },
  {
    slug: "japan-kultura",
    naziv: "Kultura u Japanu",
    opis: "Tradicionalni hramovi i čajna ceremonija",
    opisDug:
      "Susret drevnog i ultramodernog: hramovi, čajne kuće i uredna urbana logistika.",
    zanimljivosti: [
      "Kyoto – tisuće hramova i svetišta.",
      "Shinkansen – brzi vlakovi točni u minutu.",
      "Etiquette: tišina u javnom prijevozu.",
    ],
    slika: "https://tse2.mm.bing.net/th/id/OIP.rhaZphFVC73nM7D_Cil7iwHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
    price: 1390,
    days: 7,
    kontinent: "Azija",
    tags: ["Kultura", "Gradovi"],
    includes: ["Vodič", "Ulaznice"],
    itinerary: [],
    gallery: [
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505062581433-5f02c3ce9f0b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505060498473-4bda4baf1b5d?auto=format&fit=crop&w=1200&q=80",
    ],
    mapQuery: "Kyoto",
  },
  {
    slug: "petra-wadi",
    naziv: "Petra i Wadi Rum",
    opis: "Pustinja i drevni grad",
    opisDug:
      "Spoj nabatejskog grada Petre i crvenih pustinjskih dolina Wadi Ruma, uz noćenje u beduinskom kampu.",
    zanimljivosti: [
      "Ulaz u Petru vodi kroz uski kanjon Siq.",
      "'Treasury' (Al-Khazneh) isklesan je u stijeni.",
      "Wadi Rum – lokacija brojnih filmova (Marsovac).",
    ],
    slika: "https://i0.wp.com/www.touristjordan.com/wp-content/uploads/2022/05/shutterstock_386921647-scaled.jpg?fit=800%2C533&ssl=1",
    price: 640,
    days: 3,
    kontinent: "Azija",
    tags: ["Pustinja", "Povijest", "Popularno"],
    includes: [
      "Džip tura Wadi Ruma",
      "Ulaznica za Petru",
      "Jedna noć u beduinskom kampu",
    ],
    itinerary: [
      { day: 1, title: "Wadi Rum", text: "Džip safari, zalazak sunca, beduinska večera." },
      { day: 2, title: "Petra", text: "The Siq, Treasury, Monastery." },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1602748323197-5a8d2fb504a3?auto=format&fit=crop&w=1200&q=70",
    ],
    mapQuery: "Petra Jordan",
  },
];

  /* JAVNI API */
  return {
    uniqueTags,
    applyFilters,
    imageFallback,
    CONTINENTS,
    DESTINACIJE,
    TURE,
  };
})();

export default DataService;
