export interface Strings {
  nav: {
    about: string;
    experience: string;
    projects: string;
    articles: string;
    gallery: string;
    dreams: string;
    friends: string;
    devComponents: string;
    devCreature: string;
    devCreatureBuilder: string;
    playground: string;
    cv: string;
  };
  playground: {
    title: string;
    subtitle: string;
    dreamsDesc: string;
    friendsDesc: string;
    devComponentsDesc: string;
    devCreatureDesc: string;
    devCreatureBuilderDesc: string;
  };
  languageToggle: {
    switchToEnglish: string;
    switchToChinese: string;
  };
  common: {
    filterSort: string;
    searchTitle: string;
    titleKeywordPlaceholder: string;
    startMonth: string;
    endMonth: string;
    startDate: string;
    endDate: string;
    sort: string;
    newest: string;
    oldest: string;
    viewGithub: string;
    noPreviewImage: string;
    pinned: string;
    filterAll: string;
    filterFeatured: string;
    filterNotFeatured: string;
    featuredFilterLabel: string;
  };
  home: {
    titleZh: string;
    titleEn: string;
    tagline: string;
    bio: string;
    aboutMe: string;
    viewProjects: string;
    featuredProjects: string;
    explore: string;
    advisor: string;
    quickLinkExperience: string;
    quickLinkExperienceDesc: string;
    quickLinkArticles: string;
    quickLinkArticlesDesc: string;
    quickLinkGallery: string;
    quickLinkGalleryDesc: string;
    quickLinkProjects: string;
    quickLinkProjectsDesc: string;
    email: string;
  };
  about: {
    skills: string;
    education: string;
    researchInterests: string;
    researchStatement: string;
    academicAchievements: string;
    experience: string;
    viewFullExperience: string;
    interests: string;
    downloadResume: string;
    resumePending: string;
    bookroll: string;
    professionalDirection: string;
  };
  experience: {
    title: string;
    subtitle: string;
    otherAwards: string;
  };
  projects: {
    title: string;
    subtitle: string;
    status: Record<"todo" | "in-progress" | "done", string>;
    noMatch: string;
    tryAdjustFilter: string;
    notFoundTitle: string;
    notFoundDesc: string;
    backToList: string;
    period: string;
    collaborators: string;
    advisor: string;
  };
  articles: {
    title: string;
    subtitle: string;
    minRating: string;
    unlimited: string;
    andAbove: string;
    noMatch: string;
    tryAdjustFilter: string;
    notFoundTitle: string;
    notFoundDesc: string;
    backToList: string;
    ratingLabel: (rating: number) => string;
  };
  gallery: {
    title: string;
    subtitle: string;
    noMatch: string;
    tryAdjustFilter: string;
    back: string;
    notFound: string;
    viewOnOpenProcessing: string;
    saveHint: (key: string) => string;
    tags: Record<
      | "click-regenerate"
      | "drag-draw"
      | "keyboard-game"
      | "button-game"
      | "drag-physics"
      | "static",
      string
    >;
    hints: Record<
      | "click-regenerate"
      | "drag-draw"
      | "keyboard-game"
      | "button-game"
      | "drag-physics",
      string
    >;
  };
  dreams: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
  };
  friends: {
    title: string;
    subtitle: string;
    iHaveCode: string;
    backendNotConfigured: string;
    loading: string;
    loadFailed: string;
    emptyTitle: string;
    emptyDesc: string;
    prev: string;
    next: string;
    goto: (index: number, nickname: string) => string;
    gotoPlain: (nickname: string) => string;
    openDetail: (nickname: string) => string;
    dragToRotate: string;
    threeDCreature: string;
  };
  term: {
    inThisProject: string;
    viewNode: string;
  };
  knowledge: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    noMatch: string;
    tryAdjustFilter: string;
    notFoundTitle: string;
    notFoundDesc: string;
    backToList: string;
    relatedProjects: string;
    relatedArticles: string;
    relatedNodes: string;
    timeline: string;
    relationType: Record<
      "prerequisite" | "related" | "applies_to" | "contrasts_with",
      string
    >;
    entryPointHint: string;
    relatedKnowledge: string;
  };
  creator: {
    inviteCode: string;
    inviteCodePlaceholder: string;
    nickname: string;
    nicknamePlaceholder: string;
    codeRequired: string;
    nicknameRequired: string;
    checkError: string;
    checking: string;
    start: string;
    invalidCode: string;
    pageTitle: string;
    backendNotConfigured: string;
    updatedTitle: string;
    submittedTitle: string;
    thanksEdit: (nickname: string) => string;
    thanksCreate: (nickname: string) => string;
    viewWall: string;
    gateSubtitle: string;
    asIdentity: (nickname: string) => string;
    editIdentity: string;
    editModeNotice: string;
    chooseKind: string;
    kind2d: string;
    kind3d: string;
    chooseGridSize: string;
    color: string;
    brush: string;
    fill: string;
    erase: string;
    undo: string;
    redo: string;
    clear: string;
    thumbnailPreview: string;
    introLabel2d: string;
    introPlaceholder2d: string;
    introPlaceholder3d: string;
    submitFailed: string;
    submitting: string;
    update: string;
    submit: string;
    paint: string;
    dragToRotateHint: string;
  };
}

export const strings: Record<"zh" | "en", Strings> = {
  zh: {
    nav: {
      about: "關於",
      experience: "經歷",
      projects: "專案",
      articles: "文章",
      gallery: "生成視覺",
      dreams: "夢想",
      friends: "朋友創作",
      devComponents: "組件預覽",
      devCreature: "怪獸預覽",
      devCreatureBuilder: "怪獸捏造",
      playground: "Playground",
      cv: "CV",
    },
    playground: {
      title: "Playground",
      subtitle:
        "比較個人、還在玩的東西——夢想清單、朋友的創作、開發用的小工具。",
      dreamsDesc: "想做的事，以及為什麼想做",
      friendsDesc: "朋友們用邀請碼創作的 2D 像素畫與 3D 怪獸",
      devComponentsDesc: "UI 組件庫預覽（開發用）",
      devCreatureDesc: "3D 怪獸走路動畫驗證（開發用）",
      devCreatureBuilderDesc: "堆積木雕刻 3D 怪獸形狀（開發用）",
    },
    languageToggle: {
      switchToEnglish: "切換成英文",
      switchToChinese: "切換成中文",
    },
    common: {
      filterSort: "篩選 / 排序",
      searchTitle: "搜尋標題",
      titleKeywordPlaceholder: "輸入標題關鍵字",
      startMonth: "起始月份",
      endMonth: "結束月份",
      startDate: "起始日期",
      endDate: "結束日期",
      sort: "排序",
      newest: "最新",
      oldest: "最久",
      viewGithub: "查看 GitHub →",
      noPreviewImage: "尚無預覽圖",
      pinned: "站長精選",
      filterAll: "不限",
      filterFeatured: "精選",
      filterNotFeatured: "非精選",
      featuredFilterLabel: "精選狀態",
    },
    home: {
      titleZh: "鄭安琋",
      titleEn: "Cheng An Hsi",
      tagline: "視覺化研究 × 人機互動 × 前端實作",
      bio: "國立臺北科技大學資工系，研究方向聚焦於 Visual Analytics 與 Human-Computer Interaction，並具備前端工程實務經驗（Angular / React）。畢業專題為資料結構與演算法視覺化學習平台 CodePulse，同時參與使用者回饋語意分析的 NLP 研究專題。",
      aboutMe: "關於我",
      viewProjects: "查看專案",
      featuredProjects: "精選專案",
      explore: "更多內容",
      advisor: "指導教授：",
      quickLinkExperience: "經歷 Experience",
      quickLinkExperienceDesc: "競賽、實習與教學經歷",
      quickLinkArticles: "文章 Articles",
      quickLinkArticlesDesc: "讀書筆記與心得整理",
      quickLinkGallery: "生成視覺 Generative Visuals",
      quickLinkGalleryDesc: "p5.js 互動式創作",
      quickLinkProjects: "全部專案 Projects",
      quickLinkProjectsDesc: "完整專案列表",
      email: "zhenganxi8@gmail.com",
    },
    about: {
      skills: "專業技能 Skills",
      education: "學歷 Education",
      researchInterests: "研究興趣 Research Interests",
      researchStatement: "研究動機 Research Statement",
      academicAchievements: "學術成果 Academic Achievements",
      experience: "競賽與經歷 Experience",
      viewFullExperience: "查看完整經歷 →",
      interests: "休閒興趣 Interests",
      downloadResume: "下載履歷 Download Resume",
      resumePending: "（履歷檔案連結待補上）",
      bookroll: "書卷",
      professionalDirection: "專業方向",
    },
    experience: {
      title: "競賽與經歷",
      subtitle: "參與過的競賽、交流活動與工作經歷。",
      otherAwards: "其他獎項",
    },
    projects: {
      title: "專案",
      subtitle: "做過、正在做的專案。",
      status: {
        todo: "todo",
        "in-progress": "doing",
        done: "done",
      },
      noMatch: "沒有符合條件的專案",
      tryAdjustFilter: "試試調整篩選條件。",
      notFoundTitle: "找不到這個專案",
      notFoundDesc: "可能已經被移除或網址有誤。",
      backToList: "← 回專案列表",
      period: "期間：",
      collaborators: "合作者：",
      advisor: "指導教授：",
    },
    articles: {
      title: "文章",
      subtitle: "讀過的書、寫下的筆記與心得。",
      minRating: "最低評分",
      unlimited: "不限",
      andAbove: " 以上",
      noMatch: "沒有符合條件的內容",
      tryAdjustFilter: "試試調整篩選條件。",
      notFoundTitle: "找不到這篇文章",
      notFoundDesc: "可能已經被移除或網址有誤。",
      backToList: "← 回文章列表",
      ratingLabel: (rating: number) => `評分 ${rating} / 5`,
    },
    gallery: {
      title: "生成視覺",
      subtitle: "捲動瀏覽畫廊，點擊作品進入互動版本。",
      noMatch: "沒有符合條件的作品",
      tryAdjustFilter: "試試調整篩選條件。",
      back: "← 回畫廊",
      notFound: "找不到這件作品。",
      viewOnOpenProcessing: "在 OpenProcessing 查看原稿 ↗",
      saveHint: (key: string) => `按下 ${key} 儲存目前畫面`,
      tags: {
        "click-regenerate": "點擊重製",
        "drag-draw": "拖曳作畫",
        "keyboard-game": "鍵盤遊戲",
        "button-game": "按鈕遊戲",
        "drag-physics": "物理拖曳",
        static: "靜態展示",
      },
      hints: {
        "click-regenerate": "點擊畫布重新產生一次構圖",
        "drag-draw": "按住滑鼠拖曳可以在畫布上留下筆觸",
        "keyboard-game": "方向鍵／WASD 移動，點擊畫面上的按鈕與選項開始遊戲",
        "button-game": "點擊 START 按鈕開始，每輪結束後再按 START 進下一輪",
        "drag-physics": "按住滑鼠可以抓取、拖曳畫面上的物件",
      },
    },
    dreams: {
      title: "夢想",
      subtitle: "想做的事，以及為什麼想做。",
      emptyTitle: "尚無夢想清單",
      emptyDesc: "之後會陸續補上想做的事。",
    },
    friends: {
      title: "朋友創作",
      subtitle: "朋友們用邀請碼創作的 2D 像素畫與 3D 怪獸。",
      iHaveCode: "我有邀請碼，我要作畫",
      backendNotConfigured:
        "後端尚未設定（缺 Supabase 環境變數），暫時無法載入朋友作品。",
      loading: "載入朋友作品中…",
      loadFailed: "載入失敗：",
      emptyTitle: "尚無朋友創作",
      emptyDesc: "之後會陸續累積邀請碼兌換後的作品。",
      prev: "上一個作品",
      next: "下一個作品",
      goto: (index: number, nickname: string) =>
        `前往第 ${index} 個作品：${nickname}`,
      gotoPlain: (nickname: string) => `前往 ${nickname} 的作品`,
      openDetail: (nickname: string) => `${nickname} 的作品，點擊放大查看`,
      dragToRotate: "拖曳旋轉視角，滾輪縮放",
      threeDCreature: "3D 怪獸",
    },
    term: {
      inThisProject: "在此專案中：",
      viewNode: "深入了解 →",
    },
    knowledge: {
      title: "知識",
      subtitle: "所學過、應用過的概念，串連專案與文章背後的知識點。",
      searchPlaceholder: "搜尋知識點",
      allCategories: "全部分類",
      noMatch: "沒有符合條件的知識點",
      tryAdjustFilter: "試試調整搜尋或分類篩選。",
      notFoundTitle: "找不到這個知識點",
      notFoundDesc: "可能已經被移除或網址有誤。",
      backToList: "← 回知識列表",
      relatedProjects: "相關專案",
      relatedArticles: "相關文章",
      relatedNodes: "相關知識點",
      timeline: "時間軸",
      relationType: {
        prerequisite: "先備知識",
        related: "相關概念",
        applies_to: "延伸應用",
        contrasts_with: "對比概念",
      },
      entryPointHint: "想更深入了解背後概念？逛逛 Knowledge →",
      relatedKnowledge: "相關知識",
    },
    creator: {
      inviteCode: "邀請碼",
      inviteCodePlaceholder: "輸入我給的邀請碼",
      nickname: "暱稱",
      nicknamePlaceholder: "會跟作品一起展示的名字",
      codeRequired: "請輸入邀請碼",
      nicknameRequired: "請輸入暱稱",
      checkError: "檢查邀請碼時發生錯誤",
      checking: "檢查邀請碼中…",
      start: "開始作畫",
      invalidCode: "邀請碼無效或已過期",
      pageTitle: "畫一個作品",
      backendNotConfigured:
        "後端尚未設定（缺 Supabase 環境變數），暫時無法提交作品。",
      updatedTitle: "作品已更新！",
      submittedTitle: "作品已送出！",
      thanksEdit: (nickname: string) =>
        `謝謝你，${nickname}，創作牆上的作品已經換成新的這張了。`,
      thanksCreate: (nickname: string) =>
        `謝謝你，${nickname}，你的作品已經掛上創作牆了。`,
      viewWall: "去創作牆看看",
      gateSubtitle:
        "輸入邀請碼和暱稱就能開始創作；已經用過的邀請碼可以重新編輯之前的作品。",
      asIdentity: (nickname: string) => `以「${nickname}」的名義創作。`,
      editIdentity: "修改邀請碼／暱稱",
      editModeNotice:
        "這個邀請碼已經用過，現在是編輯模式——送出後會覆蓋你原本的作品。",
      chooseKind: "選擇創作類型（開始之後就不能換囉）",
      kind2d: "2D 像素風",
      kind3d: "3D 怪獸塗色",
      chooseGridSize: "選一個畫布尺寸（開始作畫後就不能改囉）",
      color: "顏色",
      brush: "畫筆",
      fill: "油漆桶",
      erase: "橡皮擦",
      undo: "上一步",
      redo: "下一步",
      clear: "清空",
      thumbnailPreview: "縮圖預覽",
      introLabel2d:
        "作品、個人敘述 or 其他（選填，別人點開你的作品時會顯示，嚴禁不當內容）",
      introPlaceholder2d: "想對看到這張圖的人說的話",
      introPlaceholder3d: "想對看到這隻怪獸的人說的話",
      submitFailed: "送出失敗：",
      submitting: "送出中…",
      update: "更新作品",
      submit: "送出作品",
      paint: "上色",
      dragToRotateHint: "左鍵拖曳塗色，右鍵拖曳轉視角，滾輪縮放。",
    },
  },
  en: {
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Projects",
      articles: "Articles",
      gallery: "Generative Visuals",
      dreams: "Dreams",
      friends: "Friends' Creations",
      devComponents: "Components Preview",
      devCreature: "Creature Preview",
      devCreatureBuilder: "Creature Builder",
      playground: "Playground",
      cv: "CV",
    },
    playground: {
      title: "Playground",
      subtitle:
        "More personal, still-in-progress things — a dream list, creations by friends, and dev tools.",
      dreamsDesc: "Things I want to do, and why",
      friendsDesc:
        "2D pixel art and 3D creatures made by friends using invite codes",
      devComponentsDesc: "UI component library preview (dev tool)",
      devCreatureDesc: "3D creature walk-animation testbed (dev tool)",
      devCreatureBuilderDesc:
        "Block-by-block 3D creature shape sculptor (dev tool)",
    },
    languageToggle: {
      switchToEnglish: "Switch to English",
      switchToChinese: "Switch to Chinese",
    },
    common: {
      filterSort: "Filter / Sort",
      searchTitle: "Search title",
      titleKeywordPlaceholder: "Enter a keyword",
      startMonth: "From month",
      endMonth: "To month",
      startDate: "From date",
      endDate: "To date",
      sort: "Sort",
      newest: "Newest",
      oldest: "Oldest",
      viewGithub: "View on GitHub →",
      noPreviewImage: "No preview yet",
      pinned: "Pinned by author",
      filterAll: "All",
      filterFeatured: "Featured",
      filterNotFeatured: "Not featured",
      featuredFilterLabel: "Featured status",
    },
    home: {
      titleZh: "Cheng An Hsi",
      titleEn: "鄭安琋",
      tagline:
        "Visualization Research × Human-Computer Interaction × Frontend Implementation",
      bio: "Computer Science undergraduate at National Taipei University of Technology, focused on Visual Analytics and Human-Computer Interaction, with hands-on frontend engineering experience (Angular / React). Capstone project: CodePulse, a data-structures-and-algorithms visualization learning platform. Also worked on an NLP research project analyzing user-feedback sentiment.",
      aboutMe: "About Me",
      viewProjects: "View Projects",
      featuredProjects: "Featured Projects",
      explore: "Explore",
      advisor: "Advisor: ",
      quickLinkExperience: "Experience",
      quickLinkExperienceDesc: "Competitions, internships, and teaching",
      quickLinkArticles: "Articles",
      quickLinkArticlesDesc: "Reading notes and reflections",
      quickLinkGallery: "Generative Visuals",
      quickLinkGalleryDesc: "Interactive p5.js creations",
      quickLinkProjects: "All Projects",
      quickLinkProjectsDesc: "Full project list",
      email: "zhenganxi8@gmail.com",
    },
    about: {
      skills: "Skills",
      education: "Education",
      researchInterests: "Research Interests",
      researchStatement: "Research Statement",
      academicAchievements: "Academic Achievements",
      experience: "Experience",
      viewFullExperience: "View full experience →",
      interests: "Interests",
      downloadResume: "Download Resume",
      resumePending: "(Resume link coming soon)",
      bookroll: "Honor Roll",
      professionalDirection: "Focus Areas",
    },
    experience: {
      title: "Experience",
      subtitle: "Competitions, exchange programs, and work experience.",
      otherAwards: "Other Awards",
    },
    projects: {
      title: "Projects",
      subtitle: "Things I have built and am building.",
      status: {
        todo: "todo",
        "in-progress": "doing",
        done: "done",
      },
      noMatch: "No projects match these filters",
      tryAdjustFilter: "Try adjusting the filters.",
      notFoundTitle: "Project not found",
      notFoundDesc: "It may have been removed, or the link is incorrect.",
      backToList: "← Back to projects",
      period: "Period: ",
      collaborators: "Collaborators: ",
      advisor: "Advisor: ",
    },
    articles: {
      title: "Articles",
      subtitle: "Books I have read, notes and reflections I have written.",
      minRating: "Min. rating",
      unlimited: "Any",
      andAbove: "+ and above",
      noMatch: "No articles match these filters",
      tryAdjustFilter: "Try adjusting the filters.",
      notFoundTitle: "Article not found",
      notFoundDesc: "It may have been removed, or the link is incorrect.",
      backToList: "← Back to articles",
      ratingLabel: (rating: number) => `Rating ${rating} / 5`,
    },
    gallery: {
      title: "Generative Visuals",
      subtitle:
        "Scroll to browse, click a piece to open its interactive version.",
      noMatch: "No pieces match these filters",
      tryAdjustFilter: "Try adjusting the filters.",
      back: "← Back to gallery",
      notFound: "This piece could not be found.",
      viewOnOpenProcessing: "View original on OpenProcessing ↗",
      saveHint: (key: string) => `Press ${key} to save the current frame`,
      tags: {
        "click-regenerate": "Click to regenerate",
        "drag-draw": "Drag to draw",
        "keyboard-game": "Keyboard game",
        "button-game": "Button game",
        "drag-physics": "Drag physics",
        static: "Static",
      },
      hints: {
        "click-regenerate": "Click the canvas to regenerate the composition",
        "drag-draw": "Hold and drag the mouse to leave strokes on the canvas",
        "keyboard-game":
          "Move with arrow keys / WASD, click on-screen buttons and options to start",
        "button-game":
          "Click START to begin; click START again after each round",
        "drag-physics": "Hold the mouse to grab and drag objects on screen",
      },
    },
    dreams: {
      title: "Dreams",
      subtitle: "Things I want to do, and why.",
      emptyTitle: "No dreams listed yet",
      emptyDesc: "More will be added over time.",
    },
    friends: {
      title: "Friends' Creations",
      subtitle:
        "2D pixel art and 3D creatures made by friends using invite codes.",
      iHaveCode: "I have an invite code",
      backendNotConfigured:
        "Backend isn't configured yet (missing Supabase environment variables), so friends' work can't load right now.",
      loading: "Loading friends' creations…",
      loadFailed: "Failed to load: ",
      emptyTitle: "No creations yet",
      emptyDesc: "More will appear as invite codes are redeemed.",
      prev: "Previous piece",
      next: "Next piece",
      goto: (index: number, nickname: string) =>
        `Go to piece ${index}: ${nickname}`,
      gotoPlain: (nickname: string) => `Go to ${nickname}'s piece`,
      openDetail: (nickname: string) => `${nickname}'s piece, click to enlarge`,
      dragToRotate: "Drag to rotate, scroll to zoom",
      threeDCreature: "3D Creature",
    },
    term: {
      inThisProject: "In this project: ",
      viewNode: "Learn more →",
    },
    knowledge: {
      title: "Knowledge",
      subtitle:
        "Concepts I've learned and applied, connecting the ideas behind projects and articles.",
      searchPlaceholder: "Search knowledge",
      allCategories: "All categories",
      noMatch: "No knowledge nodes match these filters",
      tryAdjustFilter: "Try adjusting the search or category filter.",
      notFoundTitle: "Knowledge node not found",
      notFoundDesc: "It may have been removed, or the link is incorrect.",
      backToList: "← Back to knowledge",
      relatedProjects: "Related Projects",
      relatedArticles: "Related Articles",
      relatedNodes: "Related Nodes",
      timeline: "Timeline",
      relationType: {
        prerequisite: "Prerequisite",
        related: "Related",
        applies_to: "Applies to",
        contrasts_with: "Contrasts with",
      },
      entryPointHint: "Want to dig into the concepts behind this? Browse Knowledge →",
      relatedKnowledge: "Related Knowledge",
    },
    creator: {
      inviteCode: "Invite Code",
      inviteCodePlaceholder: "Enter the code I gave you",
      nickname: "Nickname",
      nicknamePlaceholder: "The name shown alongside your creation",
      codeRequired: "Please enter an invite code",
      nicknameRequired: "Please enter a nickname",
      checkError: "Something went wrong while checking the invite code",
      checking: "Checking invite code…",
      start: "Start Creating",
      invalidCode: "This invite code is invalid or has expired",
      pageTitle: "Create a Piece",
      backendNotConfigured:
        "Backend isn't configured yet (missing Supabase environment variables), so submissions aren't available right now.",
      updatedTitle: "Piece updated!",
      submittedTitle: "Piece submitted!",
      thanksEdit: (nickname: string) =>
        `Thanks, ${nickname} — the piece on the wall has been replaced with this new one.`,
      thanksCreate: (nickname: string) =>
        `Thanks, ${nickname} — your piece is now up on the wall.`,
      viewWall: "See the wall",
      gateSubtitle:
        "Enter an invite code and a nickname to start creating; an already-used code lets you re-edit your previous piece.",
      asIdentity: (nickname: string) => `Creating as "${nickname}".`,
      editIdentity: "Edit invite code / nickname",
      editModeNotice:
        "This invite code has already been used — you're in edit mode now, and submitting will overwrite your original piece.",
      chooseKind: "Choose a creation type (can't be changed once you start)",
      kind2d: "2D Pixel Art",
      kind3d: "3D Creature Painting",
      chooseGridSize:
        "Choose a canvas size (can't be changed once you start drawing)",
      color: "Color",
      brush: "Brush",
      fill: "Fill",
      erase: "Erase",
      undo: "Undo",
      redo: "Redo",
      clear: "Clear",
      thumbnailPreview: "Thumbnail preview",
      introLabel2d:
        "A description or note about your piece (optional, shown when others open it — no inappropriate content)",
      introPlaceholder2d: "Something you'd like to say to whoever sees this",
      introPlaceholder3d:
        "Something you'd like to say to whoever sees this creature",
      submitFailed: "Submission failed: ",
      submitting: "Submitting…",
      update: "Update Piece",
      submit: "Submit Piece",
      paint: "Paint",
      dragToRotateHint:
        "Left-click drag to paint, right-click drag to rotate, scroll to zoom.",
    },
  },
};
