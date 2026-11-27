/* LKatalog — Logika Interaktif Aman (Anti-XSS textContent, Zero Hardcoded Secrets) */
(function () {
  "use strict";

  const STORAGE_KEYS = {
    products: "lkatalog_products_v2",
    stores: "lkatalog_stores_v1",
    session: "lkatalog_session_v1",
    favorites: "lkatalog_favorites_v1"
  };

  const CATEGORIES = [
    "Semua",
    "Kuliner & Olahan",
    "Minuman & Kopi",
    "Camilan & Oleh-oleh",
    "Bumbu & Bahan Pokok",
    "Kerajinan & Fashion"
  ];

  // Ilustrasi SVG kategori (Data URI lokal — aman di bawah CSP img-src 'self' data:)
  function buildCategoryIllustration(category, accentColor, bgColor, symbolText) {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">',
      "<defs>",
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0%" stop-color="' + bgColor + '"/>',
      '<stop offset="100%" stop-color="#f8fafc"/>',
      "</linearGradient>",
      "</defs>",
      '<rect width="640" height="480" fill="url(#g)"/>',
      '<circle cx="520" cy="95" r="90" fill="' + accentColor + '" opacity="0.18"/>',
      '<circle cx="110" cy="390" r="110" fill="#0f172a" opacity="0.06"/>',
      '<rect x="195" y="105" width="250" height="220" rx="34" fill="#ffffff" stroke="' + accentColor + '" stroke-width="6"/>',
      '<circle cx="320" cy="195" r="48" fill="' + accentColor + '" opacity="0.22"/>',
      '<text x="320" y="213" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="44" font-weight="800" fill="#0f172a">' + symbolText + "</text>",
      '<rect x="235" y="268" width="170" height="28" rx="14" fill="#0f172a"/>',
      '<text x="320" y="287" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700" fill="#facc15">' + category.replace(/&/g, "dan") + "</text>",
      '<text x="320" y="380" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="16" font-weight="700" fill="#334155">UMKM Kota Langsa • LKatalog</text>',
      "</svg>"
    ].join("");
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  const CATEGORY_ART = {
    "Kuliner & Olahan": buildCategoryIllustration("Kuliner dan Olahan", "#16a34a", "#dcfce7", "KL"),
    "Minuman & Kopi": buildCategoryIllustration("Minuman dan Kopi", "#0284c7", "#e0f2fe", "MK"),
    "Camilan & Oleh-oleh": buildCategoryIllustration("Camilan dan Oleh-oleh", "#eab308", "#fef9c3", "CO"),
    "Bumbu & Bahan Pokok": buildCategoryIllustration("Bumbu dan Bahan Pokok", "#16a34a", "#e0f2fe", "BB"),
    "Kerajinan & Fashion": buildCategoryIllustration("Kerajinan dan Fashion", "#0284c7", "#fef9c3", "KF")
  };

  function getIllustrationForCategory(category) {
    return CATEGORY_ART[category] || CATEGORY_ART["Kuliner & Olahan"];
  }

  // Data katalog awal publik (tanpa kredensial/rahasia apa pun)
  const INITIAL_PRODUCTS = [
    {
      id: "prd-langsa-1",
      storeId: "pub-store-1",
      storeName: "Dapur Mangrove Kuala",
      contact: "0812-0000-1101 (Contoh)",
      name: "Sirup Mangrove Organik Kuala Langsa",
      price: 35000,
      unit: "botol 500ml",
      stock: 28,
      category: "Minuman & Kopi",
      district: "Langsa Barat",
      village: "Gampong Kuala Langsa",
      description: "Sirup olahan buah mangrove segar khas pesisir Kuala Langsa tanpa pemanis buatan. Cocok disajikan dingin sebagai minuman penyegar atau oleh-oleh.",
      image: "images/sirup-mangrove.jpg",
      createdAt: 1732500000000
    },
    {
      id: "prd-langsa-2",
      storeId: "pub-store-2",
      storeName: "Pesisir Rasa Langsa",
      contact: "0812-0000-1102 (Contoh)",
      name: "Terasi Sangrai & Sambal Belacan Langsa",
      price: 22000,
      unit: "toples 200gr",
      stock: 42,
      category: "Bumbu & Bahan Pokok",
      district: "Langsa Kota",
      village: "Gampong Jawa",
      description: "Olahan udang rebon pilihan dari pesisir timur Aceh yang disangrai higienis. Aroma harum kuat, siap pakai untuk sambal dan masakan harian.",
      image: "images/terasi-langsa.jpg",
      createdAt: 1732500100000
    },
    {
      id: "prd-langsa-3",
      storeId: "pub-store-3",
      storeName: "Keripik Baro Jaya",
      contact: "0812-0000-1103 (Contoh)",
      name: "Keripik Singkong Renyah Bumbu Balado",
      price: 15000,
      unit: "bungkus 250gr",
      stock: 60,
      category: "Camilan & Oleh-oleh",
      district: "Langsa Baro",
      village: "Gampong Karang Anyar",
      description: "Keripik singkong iris tipis khas Karang Anyar dengan bumbu pedas manis renyah dan kemasan kedap udara.",
      image: "images/keripik-singkong.jpg",
      createdAt: 1732500200000
    },
    {
      id: "prd-langsa-4",
      storeId: "pub-store-1",
      storeName: "Dapur Mangrove Kuala",
      contact: "0812-0000-1101 (Contoh)",
      name: "Peyek & Keripik Daun Jeruju Mangrove",
      price: 18000,
      unit: "bungkus 180gr",
      stock: 34,
      category: "Camilan & Oleh-oleh",
      district: "Langsa Barat",
      village: "Gampong Kuala Langsa",
      description: "Camilan renyah berwarna hijau alami dari daun mangrove jenis jeruju dengan racikan rempah lokal Kota Langsa.",
      image: "images/peyek-mangrove.jpg",
      createdAt: 1732500300000
    },
    {
      id: "prd-langsa-5",
      storeId: "pub-store-4",
      storeName: "Roastery Peukan Langsa",
      contact: "0812-0000-1104 (Contoh)",
      name: "Kopi Bubuk Robusta Sangrai Tradisional",
      price: 45000,
      unit: "kemasan 250gr",
      stock: 19,
      category: "Minuman & Kopi",
      district: "Langsa Kota",
      village: "Peukan Langsa",
      description: "Biji kopi pilihan disangrai medium-dark secara segar setiap pekan di Peukan Langsa. Rasa pekat beraroma karamel khas warung kopi Aceh.",
      image: "images/kopi-peukan.jpg",
      createdAt: 1732500400000
    },
    {
      id: "prd-langsa-6",
      storeId: "pub-store-5",
      storeName: "Rempah Meurandeh",
      contact: "0812-0000-1105 (Contoh)",
      name: "Dendeng Jantung Pisang Rempah Aceh",
      price: 28000,
      unit: "kotak 200gr",
      stock: 15,
      category: "Kuliner & Olahan",
      district: "Langsa Lama",
      village: "Gampong Meurandeh",
      description: "Lauk sehat berbahan jantung pisang pilihan yang diolah bersama bumbu ketumbar, bawang, dan rempah khas tanpa pengawet.",
      image: "images/dendeng-jantung-pisang.jpg",
      createdAt: 1732500500000
    },
    {
      id: "prd-langsa-7",
      storeId: "pub-store-6",
      storeName: "Bumbu Timur Sejahtera",
      contact: "0812-0000-1106 (Contoh)",
      name: "Pliek U Kering & Bumbu Kuah Pliek",
      price: 20000,
      unit: "paket 250gr",
      stock: 30,
      category: "Bumbu & Bahan Pokok",
      district: "Langsa Timur",
      village: "Alue Pineung",
      description: "Pliek U hasil fermentasi kelapa tradisional yang bersih dan harum, lengkap dengan racikan bumbu gulai khas Aceh.",
      image: "images/pliek-u.jpg",
      createdAt: 1732500600000
    },
    {
      id: "prd-langsa-8",
      storeId: "pub-store-7",
      storeName: "Kriya Pesisir Langsa",
      contact: "0812-0000-1107 (Contoh)",
      name: "Tas Anyaman Purun Motif Pesisir",
      price: 75000,
      unit: "buah",
      stock: 12,
      category: "Kerajinan & Fashion",
      district: "Langsa Lama",
      village: "Gampong Seulalah",
      description: "Tas belanja dan suvenir ramah lingkungan hasil anyaman tangan pengrajin lokal dengan jahitan rapi dan pegangan kokoh.",
      image: "images/tas-purun.jpg",
      createdAt: 1732500700000
    }
  ];

  // Utilitas Storage Aman (dibungkus try/catch)
  function safeGetJSON(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function safeSetJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function safeRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (_err) {
      // Abaikan jika storage diblokir
    }
  }

  // Utilitas Hash Kata Sandi dengan Web Crypto API (SHA-256 + Salt Acak)
  function generateSaltHex() {
    const bytes = new Uint8Array(16);
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes)
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  async function hashPassword(password, salt) {
    const payload = salt + ":" + password;
    if (window.crypto && window.crypto.subtle && typeof TextEncoder !== "undefined") {
      const encoded = new TextEncoder().encode(payload);
      const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
      return Array.from(new Uint8Array(buffer))
        .map(function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
    }
    // Fallback deterministik bila dijalankan di non-secure context lokal
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < payload.length; i += 1) {
      const ch = payload.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }

  function formatRupiah(amount) {
    const num = Number(amount);
    if (!Number.isFinite(num)) return "Rp 0";
    return "Rp " + Math.round(num).toLocaleString("id-ID");
  }

  function isSafeImageSrc(src) {
    if (typeof src !== "string") return false;
    return /^images\/[a-z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(src) ||
      src.startsWith("data:image/png;base64,") ||
      src.startsWith("data:image/jpeg;base64,") ||
      src.startsWith("data:image/webp;base64,") ||
      src.startsWith("data:image/svg+xml;charset=UTF-8,");
  }

  function clearChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  // State Aplikasi
  const state = {
    products: [],
    stores: [],
    session: null,
    favorites: [],
    view: "catalog", // "catalog" | "favorites" | "dashboard"
    search: "",
    category: "Semua",
    district: "Semua",
    sort: "newest",
    activeDetailId: null,
    pendingDeleteId: null,
    uploadedImageDataUrl: ""
  };

  // Referensi Elemen DOM
  const els = {
    brandHomeLink: document.getElementById("brandHomeLink"),
    navCatalogBtn: document.getElementById("navCatalogBtn"),
    navFavBtn: document.getElementById("navFavBtn"),
    navDashboardBtn: document.getElementById("navDashboardBtn"),
    favCountBadge: document.getElementById("favCountBadge"),
    mobileFavCountBadge: document.getElementById("mobileFavCountBadge"),
    authActionBtn: document.getElementById("authActionBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    mobileMenuBtn: document.getElementById("mobileMenuBtn"),
    mobileMenuPanel: document.getElementById("mobileMenuPanel"),
    mobileCatalogBtn: document.getElementById("mobileCatalogBtn"),
    mobileFavBtn: document.getElementById("mobileFavBtn"),
    mobileDashboardBtn: document.getElementById("mobileDashboardBtn"),
    heroSellerBtn: document.getElementById("heroSellerBtn"),
    statTotalProducts: document.getElementById("statTotalProducts"),
    statTotalStores: document.getElementById("statTotalStores"),
    statTotalDistricts: document.getElementById("statTotalDistricts"),
    catalogSection: document.getElementById("catalogSection"),
    dashboardSection: document.getElementById("dashboardSection"),
    searchInput: document.getElementById("searchInput"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    districtFilter: document.getElementById("districtFilter"),
    sortSelect: document.getElementById("sortSelect"),
    categoryChips: document.getElementById("categoryChips"),
    catalogHeading: document.getElementById("catalogHeading"),
    resultSummary: document.getElementById("resultSummary"),
    resetFilterBtn: document.getElementById("resetFilterBtn"),
    productGrid: document.getElementById("productGrid"),
    emptyState: document.getElementById("emptyState"),
    emptyStateTitle: document.getElementById("emptyStateTitle"),
    emptyStateDesc: document.getElementById("emptyStateDesc"),
    emptyResetBtn: document.getElementById("emptyResetBtn"),
    dashStoreName: document.getElementById("dashStoreName"),
    dashStoreMeta: document.getElementById("dashStoreMeta"),
    backToCatalogBtn: document.getElementById("backToCatalogBtn"),
    openNewProductBtn: document.getElementById("openNewProductBtn"),
    productFormTitle: document.getElementById("productFormTitle"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    productForm: document.getElementById("productForm"),
    editProductId: document.getElementById("editProductId"),
    prodName: document.getElementById("prodName"),
    prodPrice: document.getElementById("prodPrice"),
    prodUnit: document.getElementById("prodUnit"),
    prodCategory: document.getElementById("prodCategory"),
    prodStock: document.getElementById("prodStock"),
    prodDistrict: document.getElementById("prodDistrict"),
    prodVillage: document.getElementById("prodVillage"),
    prodDesc: document.getElementById("prodDesc"),
    prodImageFile: document.getElementById("prodImageFile"),
    productFormError: document.getElementById("productFormError"),
    saveProductBtn: document.getElementById("saveProductBtn"),
    myProductCount: document.getElementById("myProductCount"),
    myProductsList: document.getElementById("myProductsList"),
    myProductsEmpty: document.getElementById("myProductsEmpty"),
    footerSellerLink: document.getElementById("footerSellerLink"),
    authModal: document.getElementById("authModal"),
    closeAuthModalBtn: document.getElementById("closeAuthModalBtn"),
    tabLoginBtn: document.getElementById("tabLoginBtn"),
    tabRegisterBtn: document.getElementById("tabRegisterBtn"),
    loginForm: document.getElementById("loginForm"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    loginError: document.getElementById("loginError"),
    registerForm: document.getElementById("registerForm"),
    regStoreName: document.getElementById("regStoreName"),
    regDistrict: document.getElementById("regDistrict"),
    regPhone: document.getElementById("regPhone"),
    regEmail: document.getElementById("regEmail"),
    regPassword: document.getElementById("regPassword"),
    registerError: document.getElementById("registerError"),
    detailModal: document.getElementById("detailModal"),
    closeDetailModalBtn: document.getElementById("closeDetailModalBtn"),
    detailCategoryBadge: document.getElementById("detailCategoryBadge"),
    detailImage: document.getElementById("detailImage"),
    detailTitle: document.getElementById("detailTitle"),
    detailPrice: document.getElementById("detailPrice"),
    detailUnit: document.getElementById("detailUnit"),
    detailDesc: document.getElementById("detailDesc"),
    detailStore: document.getElementById("detailStore"),
    detailLocation: document.getElementById("detailLocation"),
    detailStock: document.getElementById("detailStock"),
    detailContact: document.getElementById("detailContact"),
    copyContactBtn: document.getElementById("copyContactBtn"),
    detailFavBtn: document.getElementById("detailFavBtn"),
    confirmModal: document.getElementById("confirmModal"),
    confirmTitle: document.getElementById("confirmTitle"),
    confirmMessage: document.getElementById("confirmMessage"),
    confirmCancelBtn: document.getElementById("confirmCancelBtn"),
    confirmOkBtn: document.getElementById("confirmOkBtn"),
    toastContainer: document.getElementById("toastContainer")
  };

  // Notifikasi Toast dalam halaman
  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = "toast-item";
    if (type === "success") toast.classList.add("toast-success");
    if (type === "error") toast.classList.add("toast-error");
    toast.textContent = message;
    els.toastContainer.appendChild(toast);
    window.setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3200);
  }

  function showFormError(el, msg) {
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function clearFormError(el) {
    el.textContent = "";
    el.classList.add("hidden");
  }

  // Muat Data Awal
  function loadState() {
    const storedProducts = safeGetJSON(STORAGE_KEYS.products, null);
    if (Array.isArray(storedProducts) && storedProducts.length > 0) {
      state.products = storedProducts;
    } else {
      state.products = INITIAL_PRODUCTS.slice();
      safeSetJSON(STORAGE_KEYS.products, state.products);
    }

    const storedStores = safeGetJSON(STORAGE_KEYS.stores, []);
    state.stores = Array.isArray(storedStores) ? storedStores : [];

    const storedFavs = safeGetJSON(STORAGE_KEYS.favorites, []);
    state.favorites = Array.isArray(storedFavs) ? storedFavs : [];

    const storedSession = safeGetJSON(STORAGE_KEYS.session, null);
    if (storedSession && storedSession.storeId) {
      const matched = state.stores.find(function (s) {
        return s.id === storedSession.storeId;
      });
      state.session = matched || null;
      if (!matched) safeRemove(STORAGE_KEYS.session);
    }
  }

  // Render Statistik & Navigasi
  function renderHeaderAndStats() {
    const uniqueStores = new Set(
      state.products.map(function (p) {
        return p.storeId;
      })
    );
    state.stores.forEach(function (s) {
      uniqueStores.add(s.id);
    });
    const uniqueDistricts = new Set(
      state.products.map(function (p) {
        return p.district;
      })
    );

    els.statTotalProducts.textContent = String(state.products.length);
    els.statTotalStores.textContent = String(uniqueStores.size);
    els.statTotalDistricts.textContent = String(Math.max(uniqueDistricts.size, 5));

    const favCount = String(state.favorites.length);
    els.favCountBadge.textContent = favCount;
    els.mobileFavCountBadge.textContent = favCount;

    if (state.session) {
      els.authActionBtn.textContent = state.session.name;
      els.logoutBtn.classList.remove("hidden");
      els.navDashboardBtn.classList.remove("hidden");
      els.mobileDashboardBtn.classList.remove("hidden");
      els.heroSellerBtn.textContent = "Buka Dasbor Toko";
    } else {
      els.authActionBtn.textContent = "Masuk Toko";
      els.logoutBtn.classList.add("hidden");
      els.navDashboardBtn.classList.add("hidden");
      els.mobileDashboardBtn.classList.add("hidden");
      els.heroSellerBtn.textContent = "Daftarkan Toko UMKM";
    }

    // Status aktif navigasi
    els.navCatalogBtn.classList.toggle("nav-pill-active", state.view === "catalog");
    els.navFavBtn.classList.toggle("nav-pill-active", state.view === "favorites");
    els.navDashboardBtn.classList.toggle("nav-pill-active", state.view === "dashboard");

    els.mobileCatalogBtn.classList.toggle("mobile-nav-active", state.view === "catalog");
    els.mobileFavBtn.classList.toggle("mobile-nav-active", state.view === "favorites");
    els.mobileDashboardBtn.classList.toggle("mobile-nav-active", state.view === "dashboard");

    els.catalogSection.classList.toggle("hidden", state.view === "dashboard");
    els.dashboardSection.classList.toggle("hidden", state.view !== "dashboard");
  }

  // Render Chip Kategori
  function renderCategoryChips() {
    clearChildren(els.categoryChips);
    CATEGORIES.forEach(function (cat) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-btn";
      if (state.category === cat) btn.classList.add("chip-btn-active");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(state.category === cat));
      btn.textContent = cat;
      btn.addEventListener("click", function () {
        state.category = cat;
        renderCategoryChips();
        renderProductGrid();
      });
      els.categoryChips.appendChild(btn);
    });
  }

  // Filter & Urutkan Produk
  function getFilteredProducts() {
    const query = state.search.trim().toLowerCase();
    let list = state.products.filter(function (item) {
      if (state.view === "favorites" && state.favorites.indexOf(item.id) === -1) {
        return false;
      }
      if (state.category !== "Semua" && item.category !== state.category) {
        return false;
      }
      if (state.district !== "Semua" && item.district !== state.district) {
        return false;
      }
      if (query) {
        const hay = [item.name, item.storeName, item.description, item.category, item.district, item.village]
          .join(" ")
          .toLowerCase();
        if (hay.indexOf(query) === -1) return false;
      }
      return true;
    });

    list = list.slice();
    if (state.sort === "price-asc") {
      list.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (state.sort === "price-desc") {
      list.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (state.sort === "name-asc") {
      list.sort(function (a, b) {
        return a.name.localeCompare(b.name, "id");
      });
    } else {
      list.sort(function (a, b) {
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    }
    return list;
  }

  // Render Grid Produk (100% textContent, DOM API aman)
  function renderProductGrid() {
    const filtered = getFilteredProducts();
    const hasFilter =
      state.search.trim() !== "" ||
      state.category !== "Semua" ||
      state.district !== "Semua";

    els.resetFilterBtn.classList.toggle("hidden", !hasFilter);
    els.clearSearchBtn.classList.toggle("hidden", state.search.trim() === "");

    if (state.view === "favorites") {
      els.catalogHeading.textContent = "Produk Tersimpan Anda";
    } else if (state.category !== "Semua") {
      els.catalogHeading.textContent = state.category;
    } else {
      els.catalogHeading.textContent = "Semua Produk UMKM Kota Langsa";
    }

    els.resultSummary.textContent =
      "Menampilkan " + filtered.length + " produk" +
      (state.district !== "Semua" ? " di " + state.district : " dari seluruh Kota Langsa");

    clearChildren(els.productGrid);

    if (filtered.length === 0) {
      els.emptyState.classList.remove("hidden");
      if (state.view === "favorites" && state.favorites.length === 0) {
        els.emptyStateTitle.textContent = "Belum ada produk tersimpan";
        els.emptyStateDesc.textContent = "Tekan ikon bintang pada kartu produk untuk menyimpannya di sini.";
      } else {
        els.emptyStateTitle.textContent = "Produk tidak ditemukan";
        els.emptyStateDesc.textContent = "Coba ubah kata kunci pencarian, kategori, atau pilihan kecamatan.";
      }
      return;
    }

    els.emptyState.classList.add("hidden");

    filtered.forEach(function (item) {
      const isFav = state.favorites.indexOf(item.id) !== -1;

      const card = document.createElement("article");
      card.className = "product-card";

      const media = document.createElement("div");
      media.className = "card-media";

      const img = document.createElement("img");
      img.className = "card-img";
      img.src = isSafeImageSrc(item.image) ? item.image : getIllustrationForCategory(item.category);
      img.alt = item.name;
      img.loading = "lazy";
      media.appendChild(img);

      const favBtn = document.createElement("button");
      favBtn.type = "button";
      favBtn.className = "card-fav-btn" + (isFav ? " card-fav-active" : "");
      favBtn.setAttribute("aria-label", isFav ? "Hapus dari tersimpan" : "Simpan produk");
      favBtn.textContent = isFav ? "★" : "☆";
      favBtn.addEventListener("click", function () {
        toggleFavorite(item.id);
      });
      media.appendChild(favBtn);

      const body = document.createElement("div");
      body.className = "card-body";

      const badges = document.createElement("div");
      badges.className = "card-badges";

      const catBadge = document.createElement("span");
      catBadge.className = "badge-green";
      catBadge.textContent = item.category;
      badges.appendChild(catBadge);

      const distBadge = document.createElement("span");
      distBadge.className = "badge-sky";
      distBadge.textContent = item.district;
      badges.appendChild(distBadge);

      const title = document.createElement("h3");
      title.className = "card-title";
      title.textContent = item.name;

      const priceWrap = document.createElement("div");
      priceWrap.className = "card-price";
      priceWrap.textContent = formatRupiah(item.price) + " ";

      const unitSpan = document.createElement("span");
      unitSpan.className = "card-unit";
      unitSpan.textContent = "/ " + item.unit;
      priceWrap.appendChild(unitSpan);

      const storeInfo = document.createElement("p");
      storeInfo.className = "card-store";
      storeInfo.textContent = item.storeName + " • " + item.village;

      const footer = document.createElement("div");
      footer.className = "card-footer";

      const stockPill = document.createElement("span");
      stockPill.className = "stock-pill" + (item.stock <= 0 ? " stock-empty" : "");
      stockPill.textContent = item.stock > 0 ? "Stok: " + item.stock : "Stok Habis";

      const detailBtn = document.createElement("button");
      detailBtn.type = "button";
      detailBtn.className = "btn-primary btn-sm";
      detailBtn.textContent = "Lihat Detail";
      detailBtn.addEventListener("click", function () {
        openDetailModal(item.id);
      });

      footer.appendChild(stockPill);
      footer.appendChild(detailBtn);

      body.appendChild(badges);
      body.appendChild(title);
      body.appendChild(priceWrap);
      body.appendChild(storeInfo);
      body.appendChild(footer);

      card.appendChild(media);
      card.appendChild(body);
      els.productGrid.appendChild(card);
    });
  }

  // Render Dasbor Toko
  function renderDashboard() {
    if (!state.session) return;
    els.dashStoreName.textContent = state.session.name;
    els.dashStoreMeta.textContent = state.session.district + " • " + state.session.phone + " • " + state.session.email;

    const myProducts = state.products.filter(function (p) {
      return p.storeId === state.session.id;
    });

    els.myProductCount.textContent = myProducts.length + " produk";
    clearChildren(els.myProductsList);

    if (myProducts.length === 0) {
      els.myProductsEmpty.classList.remove("hidden");
      return;
    }

    els.myProductsEmpty.classList.add("hidden");

    myProducts.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "my-product-row";

      const info = document.createElement("div");
      info.className = "my-product-info";

      const thumb = document.createElement("img");
      thumb.className = "my-product-thumb";
      thumb.src = isSafeImageSrc(item.image) ? item.image : getIllustrationForCategory(item.category);
      thumb.alt = item.name;
      info.appendChild(thumb);

      const textCol = document.createElement("div");

      const nameEl = document.createElement("strong");
      nameEl.className = "block text-sm font-bold text-slate-900";
      nameEl.textContent = item.name;

      const metaEl = document.createElement("span");
      metaEl.className = "block text-xs text-slate-600 mt-0.5";
      metaEl.textContent = formatRupiah(item.price) + " / " + item.unit + " • Stok " + item.stock;

      textCol.appendChild(nameEl);
      textCol.appendChild(metaEl);
      info.appendChild(textCol);

      const actions = document.createElement("div");
      actions.className = "my-product-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-outline-dark btn-sm";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", function () {
        startEditProduct(item.id);
      });

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-danger btn-sm";
      delBtn.textContent = "Hapus";
      delBtn.addEventListener("click", function () {
        openConfirmDelete(item.id, item.name);
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      row.appendChild(info);
      row.appendChild(actions);
      els.myProductsList.appendChild(row);
    });
  }

  // Favorit
  function toggleFavorite(productId) {
    const idx = state.favorites.indexOf(productId);
    if (idx === -1) {
      state.favorites.push(productId);
      showToast("Produk ditambahkan ke daftar tersimpan.", "success");
    } else {
      state.favorites.splice(idx, 1);
      showToast("Produk dihapus dari daftar tersimpan.");
    }
    safeSetJSON(STORAGE_KEYS.favorites, state.favorites);
    renderHeaderAndStats();
    renderProductGrid();
    if (state.activeDetailId === productId) {
      updateDetailFavButton(productId);
    }
  }

  function updateDetailFavButton(productId) {
    const isFav = state.favorites.indexOf(productId) !== -1;
    els.detailFavBtn.textContent = isFav ? "Tersimpan ★" : "Simpan ☆";
  }

  // Modal Detail Produk
  function openDetailModal(productId) {
    const item = state.products.find(function (p) {
      return p.id === productId;
    });
    if (!item) return;

    state.activeDetailId = item.id;
    els.detailCategoryBadge.textContent = item.category;
    els.detailImage.src = isSafeImageSrc(item.image) ? item.image : getIllustrationForCategory(item.category);
    els.detailImage.alt = item.name;
    els.detailTitle.textContent = item.name;
    els.detailPrice.textContent = formatRupiah(item.price);
    els.detailUnit.textContent = "/ " + item.unit;
    els.detailDesc.textContent = item.description;
    els.detailStore.textContent = item.storeName;
    els.detailLocation.textContent = item.village + ", " + item.district;
    els.detailStock.textContent = item.stock > 0 ? item.stock + " tersedia" : "Habis";
    els.detailContact.textContent = item.contact;
    updateDetailFavButton(item.id);
    els.detailModal.classList.remove("hidden");
  }

  function closeDetailModal() {
    state.activeDetailId = null;
    els.detailModal.classList.add("hidden");
  }

  // Salin Kontak (dengan fallback execCommand)
  function copyTextSafely(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(
        function () {
          showToast("Kontak toko berhasil disalin.", "success");
        },
        function () {
          fallbackCopyText(text);
        }
      );
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.setAttribute("readonly", "");
    temp.className = "sr-only";
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand("copy");
      showToast("Kontak toko berhasil disalin.", "success");
    } catch (_err) {
      showToast("Salin manual nomor kontak: " + text);
    }
    document.body.removeChild(temp);
  }

  // Modal Autentikasi
  function openAuthModal(defaultTab) {
    clearFormError(els.loginError);
    clearFormError(els.registerError);
    switchAuthTab(defaultTab || "login");
    els.authModal.classList.remove("hidden");
  }

  function closeAuthModal() {
    els.authModal.classList.add("hidden");
  }

  function switchAuthTab(tab) {
    const isLogin = tab === "login";
    els.tabLoginBtn.classList.toggle("auth-tab-active", isLogin);
    els.tabLoginBtn.setAttribute("aria-selected", String(isLogin));
    els.tabRegisterBtn.classList.toggle("auth-tab-active", !isLogin);
    els.tabRegisterBtn.setAttribute("aria-selected", String(!isLogin));
    els.loginForm.classList.toggle("hidden", !isLogin);
    els.registerForm.classList.toggle("hidden", isLogin);
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    clearFormError(els.registerError);

    const name = els.regStoreName.value.trim();
    const district = els.regDistrict.value;
    const phone = els.regPhone.value.trim();
    const email = els.regEmail.value.trim().toLowerCase();
    const password = els.regPassword.value;

    if (name.length < 3) {
      showFormError(els.registerError, "Nama toko minimal 3 karakter.");
      return;
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(phone)) {
      showFormError(els.registerError, "Nomor kontak harus berupa angka valid (8–20 karakter).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFormError(els.registerError, "Format email toko tidak valid.");
      return;
    }
    if (password.length < 6) {
      showFormError(els.registerError, "Kata sandi minimal 6 karakter.");
      return;
    }

    const exists = state.stores.some(function (s) {
      return s.email === email;
    });
    if (exists) {
      showFormError(els.registerError, "Email ini sudah terdaftar. Silakan masuk melalui tab Masuk Toko.");
      return;
    }

    const salt = generateSaltHex();
    const passwordHash = await hashPassword(password, salt);

    const newStore = {
      id: "store-" + Date.now(),
      name: name,
      district: district,
      phone: phone,
      email: email,
      salt: salt,
      passwordHash: passwordHash
    };

    state.stores.push(newStore);
    safeSetJSON(STORAGE_KEYS.stores, state.stores);

    state.session = newStore;
    safeSetJSON(STORAGE_KEYS.session, { storeId: newStore.id });

    els.registerForm.reset();
    closeAuthModal();
    setView("dashboard");
    resetProductForm();
    els.prodDistrict.value = newStore.district;
    showToast("Toko " + newStore.name + " berhasil didaftarkan!", "success");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    clearFormError(els.loginError);

    const email = els.loginEmail.value.trim().toLowerCase();
    const password = els.loginPassword.value;

    if (!email || !password) {
      showFormError(els.loginError, "Email dan kata sandi wajib diisi.");
      return;
    }

    const store = state.stores.find(function (s) {
      return s.email === email;
    });
    if (!store) {
      showFormError(els.loginError, "Akun toko belum terdaftar. Silakan buat akun di tab Daftar Toko Baru.");
      return;
    }

    const computedHash = await hashPassword(password, store.salt);
    if (computedHash !== store.passwordHash) {
      showFormError(els.loginError, "Email atau kata sandi tidak sesuai.");
      return;
    }

    state.session = store;
    safeSetJSON(STORAGE_KEYS.session, { storeId: store.id });
    els.loginForm.reset();
    closeAuthModal();
    setView("dashboard");
    resetProductForm();
    els.prodDistrict.value = store.district;
    showToast("Selamat datang kembali, " + store.name + "!", "success");
  }

  function handleLogout() {
    state.session = null;
    safeRemove(STORAGE_KEYS.session);
    resetProductForm();
    setView("catalog");
    showToast("Anda telah keluar dari akun toko.");
  }

  // CRUD Produk Toko
  function resetProductForm() {
    els.productForm.reset();
    els.editProductId.value = "";
    state.uploadedImageDataUrl = "";
    els.productFormTitle.textContent = "Tambah Produk Baru";
    els.saveProductBtn.textContent = "Simpan Produk ke Katalog";
    els.cancelEditBtn.classList.add("hidden");
    clearFormError(els.productFormError);
    if (state.session) {
      els.prodDistrict.value = state.session.district;
    }
  }

  function startEditProduct(productId) {
    if (!state.session) return;
    const item = state.products.find(function (p) {
      return p.id === productId && p.storeId === state.session.id;
    });
    if (!item) return;

    els.editProductId.value = item.id;
    els.prodName.value = item.name;
    els.prodPrice.value = String(item.price);
    els.prodUnit.value = item.unit;
    els.prodCategory.value = item.category;
    els.prodStock.value = String(item.stock);
    els.prodDistrict.value = item.district;
    els.prodVillage.value = item.village;
    els.prodDesc.value = item.description;
    state.uploadedImageDataUrl = item.image || "";
    els.prodImageFile.value = "";
    els.productFormTitle.textContent = "Edit Produk";
    els.saveProductBtn.textContent = "Simpan Perubahan";
    els.cancelEditBtn.classList.remove("hidden");
    clearFormError(els.productFormError);
    els.prodName.focus();
  }

  function handleImageUpload(event) {
    clearFormError(els.productFormError);
    const file = event.target.files && event.target.files[0];
    if (!file) {
      state.uploadedImageDataUrl = "";
      return;
    }
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (allowed.indexOf(file.type) === -1) {
      showFormError(els.productFormError, "Format foto harus PNG, JPG, atau WebP.");
      els.prodImageFile.value = "";
      state.uploadedImageDataUrl = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      showFormError(els.productFormError, "Ukuran foto maksimal 1 MB agar katalog tetap cepat.");
      els.prodImageFile.value = "";
      state.uploadedImageDataUrl = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      if (typeof reader.result === "string" && isSafeImageSrc(reader.result)) {
        state.uploadedImageDataUrl = reader.result;
        showToast("Foto produk siap disimpan.", "success");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleProductFormSubmit(event) {
    event.preventDefault();
    clearFormError(els.productFormError);

    if (!state.session) {
      openAuthModal("login");
      return;
    }

    const name = els.prodName.value.trim();
    const price = Number(els.prodPrice.value);
    const unit = els.prodUnit.value.trim();
    const category = els.prodCategory.value;
    const stock = Number(els.prodStock.value);
    const district = els.prodDistrict.value;
    const village = els.prodVillage.value.trim();
    const description = els.prodDesc.value.trim();

    if (name.length < 3) {
      showFormError(els.productFormError, "Nama produk minimal 3 karakter.");
      return;
    }
    if (!Number.isFinite(price) || price < 500 || price > 100000000) {
      showFormError(els.productFormError, "Masukkan harga yang valid (minimal Rp 500).");
      return;
    }
    if (unit.length < 1) {
      showFormError(els.productFormError, "Satuan produk wajib diisi.");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      showFormError(els.productFormError, "Stok tidak boleh bernilai negatif.");
      return;
    }
    if (village.length < 2) {
      showFormError(els.productFormError, "Nama gampong atau area toko wajib diisi.");
      return;
    }
    if (description.length < 10) {
      showFormError(els.productFormError, "Deskripsi produk minimal 10 karakter.");
      return;
    }

    const imageToUse = isSafeImageSrc(state.uploadedImageDataUrl)
      ? state.uploadedImageDataUrl
      : getIllustrationForCategory(category);

    const editId = els.editProductId.value;
    if (editId) {
      const idx = state.products.findIndex(function (p) {
        return p.id === editId && p.storeId === state.session.id;
      });
      if (idx !== -1) {
        state.products[idx] = {
          id: state.products[idx].id,
          storeId: state.session.id,
          storeName: state.session.name,
          contact: state.session.phone,
          name: name,
          price: Math.round(price),
          unit: unit,
          stock: Math.round(stock),
          category: category,
          district: district,
          village: village,
          description: description,
          image: imageToUse,
          createdAt: state.products[idx].createdAt
        };
        safeSetJSON(STORAGE_KEYS.products, state.products);
        resetProductForm();
        renderHeaderAndStats();
        renderDashboard();
        renderProductGrid();
        showToast("Perubahan produk berhasil disimpan.", "success");
      }
      return;
    }

    const newProduct = {
      id: "prd-" + Date.now(),
      storeId: state.session.id,
      storeName: state.session.name,
      contact: state.session.phone,
      name: name,
      price: Math.round(price),
      unit: unit,
      stock: Math.round(stock),
      category: category,
      district: district,
      village: village,
      description: description,
      image: imageToUse,
      createdAt: Date.now()
    };

    state.products.unshift(newProduct);
    safeSetJSON(STORAGE_KEYS.products, state.products);
    resetProductForm();
    renderHeaderAndStats();
    renderDashboard();
    renderProductGrid();
    showToast("Produk baru berhasil ditambahkan ke LKatalog!", "success");
  }

  // Modal Konfirmasi Hapus
  function openConfirmDelete(productId, productName) {
    state.pendingDeleteId = productId;
    els.confirmTitle.textContent = "Hapus Produk?";
    els.confirmMessage.textContent = 'Produk "' + productName + '" akan dihapus permanen dari katalog toko Anda.';
    els.confirmModal.classList.remove("hidden");
  }

  function closeConfirmDelete() {
    state.pendingDeleteId = null;
    els.confirmModal.classList.add("hidden");
  }

  function executeDeleteProduct() {
    if (!state.pendingDeleteId || !state.session) {
      closeConfirmDelete();
      return;
    }
    state.products = state.products.filter(function (p) {
      return !(p.id === state.pendingDeleteId && p.storeId === state.session.id);
    });
    state.favorites = state.favorites.filter(function (id) {
      return id !== state.pendingDeleteId;
    });
    safeSetJSON(STORAGE_KEYS.products, state.products);
    safeSetJSON(STORAGE_KEYS.favorites, state.favorites);
    if (els.editProductId.value === state.pendingDeleteId) {
      resetProductForm();
    }
    closeConfirmDelete();
    renderHeaderAndStats();
    renderDashboard();
    renderProductGrid();
    showToast("Produk telah dihapus dari katalog.");
  }

  // Navigasi Tampilan
  function setView(viewName) {
    if (viewName === "dashboard" && !state.session) {
      openAuthModal("login");
      return;
    }
    state.view = viewName;
    els.mobileMenuPanel.classList.add("hidden");
    els.mobileMenuBtn.setAttribute("aria-expanded", "false");
    renderHeaderAndStats();
    if (viewName === "dashboard") {
      renderDashboard();
    } else {
      renderProductGrid();
    }
  }

  function resetFilters() {
    state.search = "";
    state.category = "Semua";
    state.district = "Semua";
    state.sort = "newest";
    els.searchInput.value = "";
    els.districtFilter.value = "Semua";
    els.sortSelect.value = "newest";
    if (state.view === "favorites" && state.favorites.length === 0) {
      state.view = "catalog";
    }
    renderHeaderAndStats();
    renderCategoryChips();
    renderProductGrid();
  }

  // Pasang Event Listener
  function bindEvents() {
    els.brandHomeLink.addEventListener("click", function (e) {
      e.preventDefault();
      setView("catalog");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    els.navCatalogBtn.addEventListener("click", function () {
      setView("catalog");
    });
    els.navFavBtn.addEventListener("click", function () {
      setView("favorites");
    });
    els.navDashboardBtn.addEventListener("click", function () {
      setView("dashboard");
    });

    els.mobileCatalogBtn.addEventListener("click", function () {
      setView("catalog");
    });
    els.mobileFavBtn.addEventListener("click", function () {
      setView("favorites");
    });
    els.mobileDashboardBtn.addEventListener("click", function () {
      setView("dashboard");
    });

    els.mobileMenuBtn.addEventListener("click", function () {
      const willOpen = els.mobileMenuPanel.classList.contains("hidden");
      els.mobileMenuPanel.classList.toggle("hidden", !willOpen);
      els.mobileMenuBtn.setAttribute("aria-expanded", String(willOpen));
    });

    els.authActionBtn.addEventListener("click", function () {
      if (state.session) {
        setView("dashboard");
      } else {
        openAuthModal("login");
      }
    });

    els.heroSellerBtn.addEventListener("click", function () {
      if (state.session) {
        setView("dashboard");
      } else {
        openAuthModal("register");
      }
    });

    els.footerSellerLink.addEventListener("click", function () {
      if (state.session) {
        setView("dashboard");
      } else {
        openAuthModal("login");
      }
    });

    els.logoutBtn.addEventListener("click", handleLogout);
    els.backToCatalogBtn.addEventListener("click", function () {
      setView("catalog");
    });
    els.openNewProductBtn.addEventListener("click", function () {
      resetProductForm();
      els.prodName.focus();
    });

    els.searchInput.addEventListener("input", function () {
      state.search = els.searchInput.value;
      renderProductGrid();
    });
    els.clearSearchBtn.addEventListener("click", function () {
      state.search = "";
      els.searchInput.value = "";
      renderProductGrid();
      els.searchInput.focus();
    });
    els.districtFilter.addEventListener("change", function () {
      state.district = els.districtFilter.value;
      renderProductGrid();
    });
    els.sortSelect.addEventListener("change", function () {
      state.sort = els.sortSelect.value;
      renderProductGrid();
    });
    els.resetFilterBtn.addEventListener("click", resetFilters);
    els.emptyResetBtn.addEventListener("click", resetFilters);

    els.closeAuthModalBtn.addEventListener("click", closeAuthModal);
    els.authModal.addEventListener("click", function (e) {
      if (e.target === els.authModal) closeAuthModal();
    });
    els.tabLoginBtn.addEventListener("click", function () {
      switchAuthTab("login");
    });
    els.tabRegisterBtn.addEventListener("click", function () {
      switchAuthTab("register");
    });
    els.loginForm.addEventListener("submit", handleLoginSubmit);
    els.registerForm.addEventListener("submit", handleRegisterSubmit);

    els.productForm.addEventListener("submit", handleProductFormSubmit);
    els.cancelEditBtn.addEventListener("click", resetProductForm);
    els.prodImageFile.addEventListener("change", handleImageUpload);

    els.closeDetailModalBtn.addEventListener("click", closeDetailModal);
    els.detailModal.addEventListener("click", function (e) {
      if (e.target === els.detailModal) closeDetailModal();
    });
    els.copyContactBtn.addEventListener("click", function () {
      if (!state.activeDetailId) return;
      const item = state.products.find(function (p) {
        return p.id === state.activeDetailId;
      });
      if (item) copyTextSafely(item.contact);
    });
    els.detailFavBtn.addEventListener("click", function () {
      if (state.activeDetailId) toggleFavorite(state.activeDetailId);
    });

    els.confirmCancelBtn.addEventListener("click", closeConfirmDelete);
    els.confirmOkBtn.addEventListener("click", executeDeleteProduct);
    els.confirmModal.addEventListener("click", function (e) {
      if (e.target === els.confirmModal) closeConfirmDelete();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAuthModal();
        closeDetailModal();
        closeConfirmDelete();
      }
    });
  }

  // Inisialisasi
  loadState();
  bindEvents();
  renderHeaderAndStats();
  renderCategoryChips();
  renderProductGrid();
})();
