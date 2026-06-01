(function() {
  'use strict';

  /* ============================================================
     CONFIG
     ============================================================ */
  var siteConfig = {
    title: "Path of Choice",
    siteTitle: "LaTale - An Exciting and Amazing Story",
    copyright: "COPYRIGHT © ACTOZ SOFT CO., LTD. ALL RIGHTS RESERVED.",
    links: {
      ultraBurning: "/event/2025/ultra-burning-5-1/",
      main: "/event/2025/4q-main/",
      specialSale: "/news/event#link=CD1C01B66FF443F3C7BC3CD94C0DBC26941E91D00AF3E7E4A6AFD9B773AC37FF33E7E5F17BAC63F879BE876BE519A442",
      specialSale2: "/news/event#link=66F890F0574046BC887BC64EC44D67B90A3DF830A9C21053C03D5784B0EB2FDCA1C0B7C401F0E218248D399F97BC960D"
    }
  };

  /* ============================================================
     ANIMATION OBSERVER
     ============================================================ */
  function AnimationManager() {
    this._queue = [];
    this._observer = null;
    this._init();
  }

  AnimationManager.prototype._init = function() {
    var self = this;
    if (typeof IntersectionObserver === 'undefined') return;
    this._observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var animationType = el.getAttribute('data-anim');
          var delay = parseInt(el.getAttribute('data-anim-delay') || '0', 10);
          var once = el.getAttribute('data-anim-once') !== 'false';
          setTimeout(function() {
            var className = 'anim-' + animationType;
            el.classList.remove('anim-hidden');
            el.classList.add(className);
            el.setAttribute('data-animation-complete', 'true');
            if (once) {
              self._observer.unobserve(el);
            }
          }, delay);
        }
      });
    }, { threshold: 0.05 });
  };

  AnimationManager.prototype.observe = function(el) {
    if (this._observer) {
      el.classList.add('anim-hidden');
      this._observer.observe(el);
    }
  };

  AnimationManager.prototype.observeImmediate = function(el) {
    // For elements with appear=true, trigger immediately
    var self = this;
    var animationType = el.getAttribute('data-anim');
    var delay = parseInt(el.getAttribute('data-anim-delay') || '0', 10);
    setTimeout(function() {
      el.classList.remove('anim-hidden');
      el.classList.add('anim-' + animationType);
      el.setAttribute('data-animation-complete', 'true');
    }, delay);
  };

  var animationManager = new AnimationManager();

  /* ============================================================
     DIRECTIVES
     ============================================================ */
  Vue.directive('animation', {
    bind: function(el, binding) {
      var config = binding.value || {};
      var animation = config.animation || 'fade';
      var delay = config.delay || 0;
      var appear = config.appear || false;
      el.setAttribute('data-anim', animation);
      el.setAttribute('data-anim-delay', delay);
      el.setAttribute('data-anim-once', 'true');
      if (appear) {
        el.classList.add('anim-hidden');
      } else {
        el.classList.add('anim-hidden');
        animationManager.observe(el);
      }
    },
    inserted: function(el, binding) {
      var config = binding.value || {};
      var appear = config.appear || false;
      if (appear) {
        animationManager.observeImmediate(el);
      }
    }
  });

  /* ============================================================
     STORE (simple reactive store replacing Pinia)
     ============================================================ */
  var store = new Vue({
    data: function() {
      return {
        popupImageClass: null,   // string[] | null
        popupPlayCode: null,     // string | null
        footerHtml: siteConfig.copyright,
        headerView: true,
        footerView: true,
        footerType: null,        // 'white' | 'black' | null
        soundState: false,
        isMobile: false
      };
    },
    computed: {
      popupFlag: function() {
        return this.popupImageFlag || this.popupPlayFlag;
      },
      popupImageFlag: function() {
        return Array.isArray(this.popupImageClass) && this.popupImageClass.length > 0;
      },
      popupPlayFlag: function() {
        return !!this.popupPlayCode;
      }
    },
    methods: {
      openImagePopup: function(imageClass) {
        if (!imageClass) return;
        this.popupImageClass = Array.isArray(imageClass) ? imageClass : [imageClass];
      },
      openPlayPopup: function(playCode) {
        this.popupPlayCode = playCode;
      },
      closePopup: function() {
        this.popupImageClass = null;
        this.popupPlayCode = null;
        // destroy youtube iframe if any
        var player = document.getElementById('youtube-player');
        if (player) player.innerHTML = '';
      }
    }
  });

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

  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);

  Vue.mixin({
    computed: {
      isMobile: function () {
        return store.isMobile;
      }
    }
  });

  /* ============================================================
     BGM PLAYER
     ============================================================ */
  var bgmAudio = new Audio('media/bgm.mp3');
  bgmAudio.loop = true;
  bgmAudio.volume = 0.1;

  var bgmState = {
    playing: false,
    play: function() {
      bgmAudio.play().then(function() {
        bgmState.playing = true;
        store.soundState = true;
      }).catch(function() {});
    },
    pause: function() {
      bgmAudio.pause();
      bgmState.playing = false;
      store.soundState = false;
    },
    stop: function() {
      bgmAudio.pause();
      bgmAudio.currentTime = 0;
      bgmState.playing = false;
      store.soundState = false;
    }
  };

  /* ============================================================
     COMPONENTS
     ============================================================ */

  /* ---- LAYOUT HEADER ---- */
  var LayoutHeader = {
    template: '#tpl-layout-header',
    data: function() {
      return {
        menuToggleFlag: true,
        store: store,
        links: siteConfig.links
      };
    },
    computed: {
      soundState: function() {
        return store.soundState;
      }
    },
    methods: {
      soundToggle: function() {
        if (store.soundState) {
          bgmState.pause();
        } else {
          bgmState.play();
        }
      }
    }
  };

  /* ---- LAYOUT FOOTER ---- */
  var LayoutFooter = {
    template: '#tpl-layout-footer',
    computed: {
      footerHtml: function() { return store.footerHtml; },
      footerType: function() { return store.footerType; }
    }
  };

  /* ---- LAYOUT HEADER MOBILE ---- */
  var LayoutHeaderMobile = {
    template: '#tpl-layout-header-mobile',
    data: function () {
      return {
        menuOpen: false,
        links: siteConfig.links,
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
  };

  /* ---- LAYOUT FOOTER MOBILE ---- */
  var LayoutFooterMobile = {
    template: '#tpl-layout-footer-mobile',
    computed: {
      footerHtml: function () { return store.footerHtml; },
      footerType: function () { return store.footerType; },
    }
  };

  /* ---- POPUP ---- */
  var PopupOverlay = {
    template: '#tpl-popup',
    data: function() { return { store: store, currentIndex: 0 }; },
    computed: {
      popupFlag: function() { return store.popupFlag; },
      popupImageFlag: function() { return store.popupImageFlag; },
      popupPlayFlag: function() { return store.popupPlayFlag; },
      popupImageClass: function() { return store.popupImageClass; },
      popupPlayCode: function() { return store.popupPlayCode; },
      hasMultipleImages: function() { return store.popupImageClass && store.popupImageClass.length > 1; }
    },
    watch: {
      popupFlag: function(val) {
        document.body.dataset.scroll = val ? 'false' : 'true';
      },
      popupPlayFlag: function(val) {
        var self = this;
        if (val) {
          self.$nextTick(function() {
            self._initYouTube();
          });
        }
      }
    },
    methods: {
      closePopup: function() { store.closePopup(); this.currentIndex = 0; },
      prevImage: function() {
        var len = store.popupImageClass ? store.popupImageClass.length : 0;
        this.currentIndex = (this.currentIndex - 1 + len) % len;
      },
      nextImage: function() {
        var len = store.popupImageClass ? store.popupImageClass.length : 0;
        this.currentIndex = (this.currentIndex + 1) % len;
      },
      _initYouTube: function() {
        var playerEl = this.$refs.youtubePlayer;
        if (!playerEl || !store.popupPlayCode) return;
        playerEl.innerHTML = '<iframe src="https://www.youtube.com/embed/' + store.popupPlayCode + '?autoplay=1&controls=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%;height:100%"></iframe>';
      }
    }
  };

  /* ---- LAYOUT WRAP ---- */
  var LayoutWrap = {
    template: '#tpl-layout-wrap',
    components: {
      'layout-header': LayoutHeader,
      'layout-header-mobile': LayoutHeaderMobile,
      'layout-footer': LayoutFooter,
      'layout-footer-mobile': LayoutFooterMobile,
      'popup-overlay': PopupOverlay
    },
    computed: {
      headerView: function() { return store.headerView; },
      footerView: function() { return store.footerView; }
    },
    mounted: function() {
      // Auto-play BGM on user interaction
      var self = this;
      var startBgm = function() {
        bgmState.play();
        document.removeEventListener('click', startBgm);
        document.removeEventListener('touchstart', startBgm);
      };
      document.addEventListener('click', startBgm);
      document.addEventListener('touchstart', startBgm);

      // Track scroll for fixed header offset
      window.addEventListener('scroll', function() {
        document.documentElement.style.setProperty('--scroll-left', window.scrollX + 'px');
      });
    }
  };

  /* ---- LEFT TITLE ---- */
  var LayoutLeftTitle = {
    template: '#tpl-left-title',
    props: {
      titleText: { type: String, default: '' }
    }
  };

  /* ---- MAIN VIEW ---- */
  var MainView = {
    template: '#tpl-main-view',
    data: function() { return { ready: false }; },
    mounted: function() {
      var self = this;
      if (store.isMobile) {
        store.footerType = 'black';
      } else {
        store.footerType = '';
      }
      // Trigger animations in sequence
      var delay = 0;
      var elements = this.$el.querySelectorAll('[data-anim]');
      elements.forEach(function(el) {
        animationManager.observe(el);
      });
      this.ready = true;
    }
  };

  /* ---- SYSTEM 1 VIEW ---- */
  var System1View = {
    template: '#tpl-system1-view',
    mounted: function() {
      store.footerType = 'white';
      this._triggerAnimations();
    },
    beforeDestroy: function() {
      store.footerType = null;
    },
    methods: {
      _triggerAnimations: function() {
        var self = this;
        self.$nextTick(function() {
          var elems = self.$el.querySelectorAll('[data-anim]');
          elems.forEach(function(el, i) {
            var delay = parseInt(el.getAttribute('data-anim-delay') || 0) + (i * 200);
            el.setAttribute('data-anim-delay', delay);
            animationManager.observeImmediate(el);
          });
        });
      }
    }
  };

  /* ---- SYSTEM 2 VIEW ---- */
  var System2View = {
    template: '#tpl-system2-view',
    mounted: function() {
      this._triggerAnimations();
    },
    methods: {
      _triggerAnimations: function() {
        var self = this;
        self.$nextTick(function() {
          var elems = self.$el.querySelectorAll('[data-anim]');
          elems.forEach(function(el, i) {
            var delay = i * 200;
            el.setAttribute('data-anim-delay', delay);
            animationManager.observeImmediate(el);
          });
        });
      }
    }
  };

  /* ---- SYSTEM 3 VIEW ---- */
  var System3View = {
    template: '#tpl-system3-view',
    mounted: function() {
      store.footerType = 'white';
      this._triggerAnimations();
    },
    beforeDestroy: function() {
      store.footerType = null;
    },
    methods: {
      _triggerAnimations: function() {
        var self = this;
        self.$nextTick(function() {
          var elems = self.$el.querySelectorAll('[data-anim]');
          elems.forEach(function(el, i) {
            var delay = i * 200;
            el.setAttribute('data-anim-delay', delay);
            animationManager.observeImmediate(el);
          });
        });
      }
    }
  };



  /* ============================================================
     ROUTER
     ============================================================ */
  var router = new VueRouter({
    mode: 'hash',
    linkActiveClass: 'active',
    linkExactActiveClass: 'exact',
    routes: [
      {
        path: '/',
        redirect: '/main'
      },
      {
        path: '/main',
        name: 'main',
        component: MainView
      },
      {
        path: '/system/1',
        name: 'system-1',
        component: System1View
      },
      {
        path: '/system/2',
        name: 'system-2',
        component: System2View
      },
      {
        path: '/system/3',
        name: 'system-3',
        component: System3View
      },
      {
        path: '*',
        redirect: '/main'
      }
    ],
    scrollBehavior: function(to, from, savedPosition) {
      if (to.name !== from.name) {
        return { x: 0, y: 0 };
      }
    }
  });

  /* Update page title and footer type on route change */
  router.afterEach(function(to) {
    var titles = {
      'main': siteConfig.title,
      'system-1': 'Zodiac System | ' + siteConfig.title,
      'system-2': 'Reputation System | ' + siteConfig.title,
      'system-3': 'Dungeon Point System | ' + siteConfig.title
    };
    document.title = titles[to.name] || siteConfig.siteTitle;
    store.footerType = null; // reset, individual views will set their own
  });

  /* ============================================================
     ROOT APP
     ============================================================ */
  new Vue({
    el: '#app',
    router: router,
    template: '#tpl-app',
    components: {
      'layout-wrap': LayoutWrap
    }
  });

})();
