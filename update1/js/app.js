/**
 * app.js - Vue2 기반 라테일 4분기 업데이트 Static SPA
 * HTML5 + CSS3 + Vue 2.7 + Vue Router 3
 * 서버 없이 로컬 파일로 실행 가능
 */

(function () {
  'use strict';

  /* ============================================================
     CONFIG
     ============================================================ */
  var LINKS = {
    site: 'https://latale.papayaplay.com/latale.do',
    update: 'https://www.latale.com/event/2025/4q-update',
    ultraBurning: 'https://www.latale.com/event/2025/ultra-burning-5-1/',
    main: 'https://www.latale.com/event/2025/4q-main/',
    specialSale: 'https://www.latale.com/news/event#link=CD1C01B66FF443F3C7BC3CD94C0DBC26941E91D00AF3E7E4A6AFD9B773AC37FF33E7E5F17BAC63F879BE876BE519A442',
  };

  var SITE_TITLE = 'LaTale - An Exciting and Amazing Story';
  var PAGE_TITLE = 'Whisper of the Devil';

  function getPageTitle(sub) {
    if (sub) return sub + ' - ' + PAGE_TITLE;
    return PAGE_TITLE;
  }

  /* ============================================================
     STORE (간단한 반응형 상태)
     ============================================================ */
  var store = Vue.observable({
    headerView: true,
    footerView: true,
    footerHtml: 'COPYRIGHT © ACTOZ SOFT CO., LTD. ALL RIGHTS RESERVED.',
    footerType: '',
    popupImageClass: null,  // string[] 또는 null
    popupPlayCode: null,    // YouTube video ID 또는 null
    soundState: false,
    bgm: null,
    menuOpen: true,
    isMobile: false,
  });

  /* ============================================================
     BGM (Howler 대신 HTML5 Audio)
     ============================================================ */
  function initBGM() {
    var audio = new Audio('media/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.1;
    store.bgm = audio;
    audio.addEventListener('play', function () { store.soundState = true; });
    audio.addEventListener('pause', function () { store.soundState = false; });
    audio.addEventListener('ended', function () { store.soundState = false; });
    // 자동 재생 (사용자 제스처 필요)
    var playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        // 자동 재생 차단됨 - 정상
      });
    }
    return audio;
  }

  function soundToggle() {
    if (!store.bgm) return;
    if (store.soundState) {
      store.bgm.pause();
    } else {
      store.bgm.play();
    }
  }

  /* ============================================================
     MOBILE DETECTION & VIEWPORT
     ============================================================ */
  function updateViewport() {
    var viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    if (store.isMobile) {
      viewport.setAttribute('content', 'width=720, user-scalable=no');
    } else {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1');
    }
  }

  function checkIsMobile() {
    var uaMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    var widthMobile = window.innerWidth <= 1024;
    var isMobile = uaMobile || widthMobile;
    if (store.isMobile !== isMobile) {
      store.isMobile = isMobile;
      updateViewport();
    }
  }

  // Initialize detection
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);

  // Global mixin to expose isMobile in all Vue components
  Vue.mixin({
    computed: {
      isMobile: function () {
        return store.isMobile;
      }
    }
  });

  /* ============================================================
     POPUP HELPERS
     ============================================================ */
  function openImagePopup(classList) {
    if (typeof classList === 'string') {
      store.popupImageClass = [classList];
    } else {
      store.popupImageClass = classList;
    }
    store.popupPlayCode = null;
    document.body.dataset.scroll = 'false';
  }

  function closePopup() {
    store.popupImageClass = null;
    store.popupPlayCode = null;
    document.body.dataset.scroll = 'true';
  }

  /* ============================================================
     INTERSECTION OBSERVER 기반 애니메이션
     ============================================================ */
  var animObserver = null;

  function initAnimations() {
    if (animObserver) {
      animObserver.disconnect();
    }
    animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.dataset.animDelay || '0', 10);
          setTimeout(function () {
            el.classList.add('anim-done');
          }, delay);
          animObserver.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    Vue.nextTick(function () {
      var els = document.querySelectorAll('[data-anim]');
      els.forEach(function (el) {
        animObserver.observe(el);
      });
    });
  }

  /* ============================================================
     SCROLL LEFT (헤더 translate 보정)
     ============================================================ */
  window.addEventListener('scroll', function () {
    document.documentElement.style.setProperty('--scroll-left', window.scrollX + 'px');
  });

  /* ============================================================
     HEADER COMPONENT
     ============================================================ */
  Vue.component('layout-header', {
    template: '#tpl-layout-header',
    data: function () {
      return {
        menuToggleFlag: true,
        links: LINKS,
        soundState: false,
      };
    },
    computed: {
      storeSoundState: function () {
        return store.soundState;
      },
    },
    watch: {
      storeSoundState: function (v) {
        this.soundState = v;
      },
    },
    methods: {
      soundToggle: soundToggle,
    },
  });

  /* ============================================================
     FOOTER COMPONENT
     ============================================================ */
  Vue.component('layout-footer', {
    template: '#tpl-layout-footer',
    computed: {
      footerHtml: function () { return store.footerHtml; },
      footerType: function () { return store.footerType; },
    },
  });

  /* ============================================================
     MOBILE HEADER & FOOTER
     ============================================================ */
  Vue.component('layout-header-mobile', {
    template: '#tpl-layout-header-mobile',
    data: function () {
      return {
        menuOpen: false,
        links: LINKS,
      };
    },
    watch: {
      '$route': function () {
        this.menuOpen = false;
      }
    },
    methods: {
      goLogin: function () {
        alert('This service requires login.');
      }
    }
  });

  Vue.component('layout-footer-mobile', {
    template: '#tpl-layout-footer-mobile',
    computed: {
      footerHtml: function () { return store.footerHtml; },
      footerType: function () { return store.footerType; },
    }
  });

  /* ============================================================
     POPUP COMPONENT
     ============================================================ */
  Vue.component('popup-overlay', {
    template: '#tpl-popup',
    data: function () {
      return {
        currentIndex: 0,
        youtubePlayer: null,
      };
    },
    computed: {
      popupFlag: function () {
        return this.popupImageFlag || this.popupPlayFlag;
      },
      popupImageFlag: function () {
        return !!(store.popupImageClass && store.popupImageClass.length > 0);
      },
      popupPlayFlag: function () {
        return !!store.popupPlayCode;
      },
      popupImageClass: function () {
        return store.popupImageClass;
      },
      hasMultipleImages: function () {
        return store.popupImageClass && store.popupImageClass.length > 1;
      },
    },
    watch: {
      popupFlag: function (v) {
        if (!v) {
          this.currentIndex = 0;
          if (this.youtubePlayer) {
            this.youtubePlayer = null;
          }
        }
      },
      popupPlayFlag: function (v) {
        var self = this;
        if (v && store.popupPlayCode) {
          self.$nextTick(function () {
            var el = document.getElementById('youtube-player');
            if (el && window.YT) {
              self.youtubePlayer = new YT.Player('youtube-player', {
                videoId: store.popupPlayCode,
                playerVars: { autoplay: 1, controls: 1 },
              });
            }
          });
        }
      },
    },
    methods: {
      closePopup: closePopup,
      prevImage: function () {
        if (!store.popupImageClass) return;
        this.currentIndex = (this.currentIndex - 1 + store.popupImageClass.length) % store.popupImageClass.length;
      },
      nextImage: function () {
        if (!store.popupImageClass) return;
        this.currentIndex = (this.currentIndex + 1) % store.popupImageClass.length;
      },
    },
  });

  /* ============================================================
     LAYOUT WRAP COMPONENT
     ============================================================ */
  Vue.component('layout-wrap', {
    template: '#tpl-layout-wrap',
    computed: {
      headerView: function () { return store.headerView; },
      footerView: function () { return store.footerView; },
    },
    mounted: function () {
      initBGM();
    },
  });

  /* ============================================================
     LEFT TITLE COMPONENT
     ============================================================ */
  Vue.component('layout-left-title', {
    template: '#tpl-left-title',
    props: {
      title: String,
      subTitle: String,
      color: { type: String, default: '' },
    },
  });

  /* ============================================================
     RIGHT MENU COMPONENT
     ============================================================ */
  Vue.component('layout-right-menu', {
    template: '#tpl-right-menu',
    props: {
      toggle: { type: Boolean, default: false },
    },
    data: function () {
      return {
        collapsed: false,
        menuOpen: false,
      };
    },
    watch: {
      '$route': function () {
        this.menuOpen = false;
      }
    }
  });

  /* ============================================================
     MAIN VIEW
     ============================================================ */
  var MainView = {
    template: '#tpl-main-view',
    data: function () {
      return { char3On: false };
    },
    mounted: function () {
      var self = this;
      if (store.isMobile) {
        store.footerType = 'black';
      } else {
        store.footerType = '';
      }
      store.footerHtml = 'COPYRIGHT © ACTOZ SOFT CO., LTD. ALL RIGHTS RESERVED.';
      document.title = getPageTitle();
      initAnimations();

      if (!store.isMobile) {
        // Circle animation for title and char-1
        self.$nextTick(function () {
          var titleCircle = document.querySelector('[data-class="title"] svg mask#circleMask2b circle');
          var char1Circle = document.querySelector('[data-class="char-1"] svg mask#circleMask1 circle');
          var char2Circle = document.querySelector('[data-class="char-1"] svg:last-child mask#circleMask2 circle');

          if (titleCircle) circleAnimation(titleCircle, 2000);
          setTimeout(function () {
            if (char1Circle) circleAnimation(char1Circle, 2000);
            if (char2Circle) circleAnimation(char2Circle, 2000);
          }, 200);
        });
      }
    },
    methods: {
      setChar3: function (val) { this.char3On = val; },
    },
  };

  /* ============================================================
     SVG Circle reveal animation
     ============================================================ */
  function circleAnimation(circle, duration) {
    if (!circle) return Promise.resolve();
    return new Promise(function (resolve) {
      var svg = circle.closest('svg');
      if (!svg) return resolve();

      var rect = svg.getBoundingClientRect();
      var svgWidth = rect.width || 300;
      var svgHeight = rect.height || 300;

      var centerX = svgWidth / 2;
      var centerY = svgHeight / 2;
      circle.setAttribute('cx', String(centerX));

      var startRadius = 0;
      var endRadius = Math.sqrt(svgWidth * svgWidth + svgHeight * svgHeight);
      var startCY = svgHeight + endRadius;
      var endCY = centerY;
      var start = null;

      function easeOutCirc(t) { return Math.sqrt(1 - Math.pow(t - 1, 2)); }
      function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

      function animate(timestamp) {
        if (start === null) start = timestamp;
        var elapsed = timestamp - start;
        var rawProgress = Math.min(elapsed / duration, 1);

        var currentRadius = startRadius + (endRadius - startRadius) * easeOutCirc(rawProgress);
        circle.setAttribute('r', String(currentRadius));

        var currentCY = startCY + (endCY - startCY) * easeInOutQuad(rawProgress);
        circle.setAttribute('cy', String(currentCY));

        if (rawProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }

      circle.setAttribute('r', '0');
      circle.setAttribute('cy', String(startCY));
      requestAnimationFrame(animate);
    });
  }

  /* ============================================================
     SENARIO VIEW
     ============================================================ */
  var SenarioView = {
    template: '#tpl-senario-view',
    mounted: function () {
      if (store.isMobile) {
        store.footerType = 'black';
      } else {
        store.footerType = 'white';
      }
      document.title = getPageTitle('Scenario');
      initAnimations();
    },
  };

  /* ============================================================
     MAP VIEWS
     ============================================================ */
  function makeMapView(id, titleText, subTitle, desc1, desc2, subTitle2, desc2text) {
    return {
      template: '#tpl-map-view',
      data: function () {
        return {
          mapId: id,
          mapTitle: titleText,
          mapSubTitle: subTitle,
          mapDescription: desc1,
          mapSubTitle2: subTitle2 || '',
          mapDescription2: desc2 || '',
          subTitleNumber: null,
        };
      },
      mounted: function () {
        store.footerType = 'white';
        document.title = getPageTitle(titleText);
        this.$emit('update:leftTitle', { subTitle: id.replace('map-', '0') });
        initAnimations();
      },
      methods: {
        openPopup: function (classList) {
          openImagePopup(classList);
        },
      },
    };
  }

  var Map1View = {
    template: '#tpl-map1-view',
    mounted: function () {
      if (store.isMobile) {
        store.footerType = 'black';
      } else {
        store.footerType = 'white';
      }
      document.title = getPageTitle('Debesys');
      this.$emit('update:left-title', { subTitle: '01' });
      initAnimations();
    },
    methods: {
      openPopup: function (cls) { openImagePopup(cls); },
    },
  };

  var Map2View = {
    template: '#tpl-map2-view',
    mounted: function () {
      if (store.isMobile) {
        store.footerType = 'black';
      } else {
        store.footerType = 'white';
      }
      document.title = getPageTitle('Whispering Hill');
      this.$emit('update:left-title', { subTitle: '02' });
      initAnimations();
    },
    methods: {
      openPopup: function (cls) { openImagePopup(cls); },
    },
  };

  var Map3View = {
    template: '#tpl-map3-view',
    mounted: function () {
      if (store.isMobile) {
        store.footerType = 'black';
      } else {
        store.footerType = 'white';
      }
      document.title = getPageTitle('Nest of the Blind Bird');
      this.$emit('update:left-title', { subTitle: '03' });
      initAnimations();
    },
    methods: {
      openPopup: function (cls) { openImagePopup(cls); },
    },
  };

  var Map4View = {
    template: '#tpl-map4-view',
    mounted: function () {
      if (store.isMobile) {
        store.footerType = 'black';
      } else {
        store.footerType = 'white';
      }
      document.title = getPageTitle('Likimo Pelkė');
      this.$emit('update:left-title', { subTitle: '04' });
      initAnimations();
    },
    methods: {
      openPopup: function (cls) { openImagePopup(cls); },
    },
  };

  var MapWrapView = {
    template: '#tpl-map-wrap-view',
    data: function () {
      return {
        leftTitleSubTitle: '01',
      };
    },
    methods: {
      onUpdateLeftTitle: function (data) {
        if (data && data.subTitle) {
          this.leftTitleSubTitle = data.subTitle;
        }
      },
    },
  };

  /* ============================================================
     BOSS MONSTER VIEWS
     ============================================================ */
  var BossMonsterWrapView = {
    template: '#tpl-boss-monster-wrap-view',
    data: function () {
      return { leftTitleSubTitle: '01' };
    },
    methods: {
      onUpdateLeftTitle: function (data) {
        if (data && data.subTitle) this.leftTitleSubTitle = data.subTitle;
      },
    },
  };

  function makeBossMonsterView(tplId, pageTitleText, subTitleNum) {
    return {
      template: tplId,
      mounted: function () {
        document.title = getPageTitle(pageTitleText);
        this.$emit('update:left-title', { subTitle: subTitleNum });
        initAnimations();
      },
    };
  }

  var BossMonster1View = makeBossMonsterView('#tpl-boss-monster-1-view', 'Monstrous Bird Peridot', '01');
  var BossMonster2View = makeBossMonsterView('#tpl-boss-monster-2-view', 'Lauma', '02');
  var BossMonster3View = makeBossMonsterView('#tpl-boss-monster-3-view', 'Giltine', '03');
  var BossMonster4View = makeBossMonsterView('#tpl-boss-monster-4-view', 'Belial', '04');

  /* ============================================================
     NORMAL MONSTER VIEW
     ============================================================ */
  var NormalMonsterView = {
    template: '#tpl-normal-monster-view',
    mounted: function () {
      store.footerType = 'white';
      document.title = getPageTitle('Normal Monsters');
      initAnimations();
    },
  };

  /* ============================================================
     NPC VIEWS
     ============================================================ */
  var NpcWrapView = {
    template: '#tpl-npc-wrap-view',
    data: function () {
      return { leftTitleSubTitle: '01' };
    },
    mounted: function () {
      if (store.isMobile) {
        store.footerType = 'black';
      } else {
        store.footerType = 'white';
      }
    },
    methods: {
      onUpdateLeftTitle: function (data) {
        if (data && data.subTitle) this.leftTitleSubTitle = data.subTitle;
      },
    },
  };

  function makeNpcView(tplId, pageTitleText, subTitleNum) {
    return {
      template: tplId,
      mounted: function () {
        document.title = getPageTitle(pageTitleText);
        this.$emit('update:left-title', { subTitle: subTitleNum });
        initAnimations();
      },
    };
  }

  var Npc1View = makeNpcView('#tpl-npc-1-view', 'Patelo', '01');
  var Npc2View = makeNpcView('#tpl-npc-2-view', 'Shuvie', '02');
  var Npc3View = makeNpcView('#tpl-npc-3-view', 'Lacellis', '03');
  var Npc4View = makeNpcView('#tpl-npc-4-view', 'Marta', '04');
  var Npc5View = makeNpcView('#tpl-npc-5-view', 'Juriring', '05');

  /* ============================================================
     HISTORY VIEW
     ============================================================ */
  var HistoryView = {
    template: '#tpl-history-view',
    data: function () {
      return {
        list: [],
        loading: false,
        paging: {
          page: 1,
          total: 1,
          size: 9,
          block: 10,
        },
        currentPage: 1,
      };
    },
    computed: {
      pagingData: function () {
        var p = this.currentPage;
        var total = this.paging.total;
        var size = this.paging.size;
        var block = this.paging.block;
        var totalPages = Math.max(1, Math.ceil(total / size));
        var blockStart = Math.floor((p - 1) / block) * block + 1;
        var blockEnd = Math.min(blockStart + block - 1, totalPages);
        return {
          page: p,
          start: blockStart,
          end: blockEnd,
          first: 1,
          last: totalPages,
          prev: Math.max(1, p - 1),
          next: Math.min(totalPages, p + 1),
        };
      },
    },
    mounted: function () {
      document.title = getPageTitle('Update History');
      store.footerType = '';
      var page = parseInt(this.$route.params.page, 10) || 1;
      this.currentPage = page;
      this.loadHistory(page);
    },
    watch: {
      '$route.params.page': function (newPage) {
        var p = parseInt(newPage, 10) || 1;
        this.currentPage = p;
        this.loadHistory(p);
      },
    },
    methods: {
      loadHistory: function (page) {
        var self = this;
        self.loading = true;
        // API 대신 더미 데이터 사용 (서버 없이 동작)
        setTimeout(function () {
          self.list = [];
          self.loading = false;
        }, 100);
      },
      goPage: function (page) {
        this.$router.push({ name: 'history', params: { page: String(page) } });
      },
    },
  };

  /* ============================================================
     ROUTER
     ============================================================ */
  var router = new VueRouter({
    mode: 'hash',
    linkActiveClass: 'router-link-active',
    linkExactActiveClass: 'router-link-exact-active',
    routes: [
      {
        path: '/',
        redirect: '/main',
      },
      {
        path: '/main',
        name: 'main',
        component: MainView,
      },
      {
        path: '/map-senario',
        redirect: '/map-senario/senario',
      },
      {
        path: '/map-senario/senario',
        name: 'senario',
        component: SenarioView,
      },
      {
        path: '/map-senario/map',
        component: MapWrapView,
        children: [
          { path: '', redirect: '1' },
          { path: '1', name: 'map-1', component: Map1View },
          { path: '2', name: 'map-2', component: Map2View },
          { path: '3', name: 'map-3', component: Map3View },
          { path: '4', name: 'map-4', component: Map4View },
        ],
      },
      {
        path: '/monster',
        redirect: '/monster/boss',
      },
      {
        path: '/monster/boss',
        component: BossMonsterWrapView,
        children: [
          { path: '', redirect: '1' },
          { path: '1', name: 'boss-1', component: BossMonster1View },
          { path: '2', name: 'boss-2', component: BossMonster2View },
          { path: '3', name: 'boss-3', component: BossMonster3View },
          { path: '4', name: 'boss-4', component: BossMonster4View },
        ],
      },
      {
        path: '/monster/normal',
        name: 'normal',
        component: NormalMonsterView,
      },
      {
        path: '/npc',
        component: NpcWrapView,
        children: [
          { path: '', redirect: '1' },
          { path: '1', name: 'npc-1', component: Npc1View },
          { path: '2', name: 'npc-2', component: Npc2View },
          { path: '3', name: 'npc-3', component: Npc3View },
          { path: '4', name: 'npc-4', component: Npc4View },
          { path: '5', name: 'npc-5', component: Npc5View },
        ],
      },
      {
        path: '/history/:page?',
        name: 'history',
        component: HistoryView,
      },
      {
        path: '*',
        redirect: '/main',
      },
    ],
    scrollBehavior: function (to, from) {
      if (to.name !== from.name) {
        return { x: 0, y: 0 };
      }
    },
  });

  /* ============================================================
     APP
     ============================================================ */
  var app = new Vue({
    el: '#app',
    router: router,
    template: '#tpl-app',
  });

})();
