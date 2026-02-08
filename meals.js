// 每日附近美食選擇
// 編輯此檔案即可更新餐廳資料，不需動 index.html
const MEALS_DATA = {
  "1": {
    "dinner": {
      "area": "薄野 (Susukino)",
      "picks": [
        { "name": "元祖札幌拉麵橫丁", "note": "白樺山莊 (味噌) / 弟子屈 (醬油)", "tag": "推薦", "mapQuery": "元祖さっぽろラーメン横丁" },
        { "name": "Sandria 本店", "note": "24H 三明治，適合帶回民宿", "mapQuery": "サンドリア 本店 札幌" },
        { "name": "麵屋雪風", "note": "深夜味噌拉麵", "mapQuery": "麺屋雪風 すすきの本店" }
      ]
    }
  },
  "2": {
    "lunch": {
      "area": "大通公園 / 狸小路",
      "picks": [
        { "name": "GARAKU 湯咖哩", "note": "人氣極高，建議 11:30 先去抽號碼牌", "tag": "推薦", "mapQuery": "GARAKU 湯咖哩 札幌" },
        { "name": "Treasure 湯咖哩", "note": "GARAKU 姊妹店，備案首選", "mapQuery": "トレジャー 湯カレー 札幌" },
        { "name": "Suage+ 湯咖哩", "note": "炸蔬菜風格湯咖哩", "mapQuery": "Suage+ 札幌" },
        { "name": "Sapporo Ichiryuan", "note": "味噌拉麵", "mapQuery": "札幌一粒庵" },
        { "name": "十勝豚丼 Ippin", "note": "炭烤豚丼", "mapQuery": "十勝豚丼いっぴん 札幌" }
      ]
    },
    "dessert": {
      "area": "大通",
      "picks": [
        { "name": "六花亭 札幌本店", "note": "雪冰淇淋和三明治", "mapQuery": "六花亭 札幌本店" }
      ]
    },
    "dinner": {
      "area": "札幌啤酒花園",
      "picks": [
        { "name": "札幌啤酒花園", "note": "成吉思汗烤肉 + 啤酒暢飲", "tag": "推薦", "mapQuery": "サッポロビール園" }
      ]
    }
  },
  "3": {
    "lunch": {
      "area": "小樽站旁「三角市場」",
      "picks": [
        { "name": "瀧波食堂", "note": "海鮮丼與活蟹", "tag": "推薦", "mapQuery": "滝波食堂 小樽" },
        { "name": "若雞時代", "note": "炸雞定食", "mapQuery": "若鶏時代 小樽" },
        { "name": "蕎麥屋 籔半 (Yabuhan)", "note": "手打蕎麥麵", "mapQuery": "藪半 小樽" },
        { "name": "小樽屋台村 紅磚橫町", "note": "多家小店選擇", "mapQuery": "小樽屋台村 レンガ横丁" },
        { "name": "cafe BAAL", "note": "牛排飯", "mapQuery": "cafe BAAL 小樽" }
      ]
    },
    "dessert": {
      "area": "小樽堺町通",
      "picks": [
        { "name": "LeTAO 本店", "note": "雙層起司蛋糕", "tag": "推薦", "mapQuery": "ルタオ 本店 小樽" },
        { "name": "北一硝子館 咖啡", "note": "復古燈飾氛圍", "mapQuery": "北一硝子 三号館 小樽" }
      ]
    },
    "dinner": {
      "area": "札幌狸小路",
      "picks": [
        { "name": "居酒屋 炎 (En)", "note": "氣氛熱鬧的居酒屋", "tag": "推薦", "mapQuery": "炎 居酒屋 狸小路" },
        { "name": "串鳥", "note": "平價串燒連鎖", "mapQuery": "串鳥 狸小路" },
        { "name": "居酒屋 瑠玖＆魚平", "note": "海鮮居酒屋", "mapQuery": "瑠玖＆魚平 札幌" },
        { "name": "結尾聖代", "note": "深夜甜點文化體驗", "mapQuery": "シメパフェ 札幌 狸小路" }
      ]
    }
  },
  "4": {
    "lunch": {
      "area": "圓山公園周邊",
      "picks": [
        { "name": "圓山鬆餅 (Maruyama Pancake)", "note": "鬆軟日式鬆餅", "tag": "推薦", "mapQuery": "Maruyama Pancake 札幌" },
        { "name": "Rojiura Curry Samurai 圓山店", "note": "隱藏版湯咖哩", "mapQuery": "侍.カレー 圓山店" },
        { "name": "Maruyama Picante", "note": "人氣湯咖哩", "mapQuery": "ピカンティ 札幌" },
        { "name": "Professor Maruyama Curry", "note": "特色咖哩飯", "mapQuery": "プロフェッサー 円山カレー" }
      ]
    },
    "dessert": {
      "area": "圓山",
      "picks": [
        { "name": "pudding maruyama", "note": "手工布丁專賣", "mapQuery": "pudding maruyama 札幌" },
        { "name": "六花亭 神宮茶屋店", "note": "限定判官燒", "mapQuery": "六花亭 神宮茶屋店" }
      ]
    },
    "dinner": {
      "area": "大通 / 薄野",
      "picks": [
        { "name": "居酒屋 魚金 (Uokin)", "note": "生魚片豪邁好吃", "tag": "推薦", "mapQuery": "魚金 札幌 薄野" },
        { "name": "Hokkaido Robinson", "note": "新鮮海鮮料理", "mapQuery": "北海道ロビンソン 札幌" },
        { "name": "耀 (Kagayoi)", "note": "高質感和牛+螃蟹涮涮鍋 (大通 BISSE 3F)", "mapQuery": "耀 大通ビッセ" },
        { "name": "NITORI NO KEYAKI 本店", "note": "味噌拉麵名店", "mapQuery": "にとりの けやき 本店" },
        { "name": "Kushidori 串燒", "note": "平價串燒", "mapQuery": "串鳥 薄野" }
      ]
    },
    "late_night": {
      "area": "薄野",
      "picks": [
        { "name": "佐藤堂 Satodo", "note": "深夜聖代", "mapQuery": "佐藤堂 札幌" },
        { "name": "帕菲咖啡 佐藤", "note": "深夜聖代名店", "mapQuery": "パフェ 佐藤 札幌" }
      ]
    }
  },
  "5": {
    "lunch": {
      "area": "手稻滑雪場內",
      "picks": [
        { "name": "K-Lounge", "note": "提供披薩、拉麵", "tag": "推薦", "mapQuery": "テイネスキー場 レストラン" }
      ]
    },
    "dinner": {
      "area": "薄野",
      "picks": [
        { "name": "溫野菜 (薄野店)", "note": "涮涮鍋吃到飽，補充蔬菜與熱量", "tag": "推薦", "mapQuery": "しゃぶしゃぶ温野菜 すすきの店" }
      ]
    }
  },
  "6": {
    "lunch": {
      "area": "手稻滑雪場內",
      "picks": [
        { "name": "滑雪場餐廳", "note": "場內用餐", "mapQuery": "テイネスキー場 レストラン" }
      ]
    },
    "dinner": {
      "area": "札幌市區 / 薄野",
      "picks": [
        { "name": "信玄拉麵", "note": "味噌拉麵名店", "mapQuery": "信玄 ラーメン 札幌" },
        { "name": "空 (Sora) 拉麵", "note": "人氣味噌拉麵", "mapQuery": "空 ラーメン 札幌" },
        { "name": "布袋 (Hotei)", "note": "大份量北海道炸雞", "mapQuery": "布袋 ザンギ 札幌" },
        { "name": "達摩 (Daruma)", "note": "成吉思汗烤肉名店", "mapQuery": "だるま 本店 札幌" },
        { "name": "松尾成吉思汗", "note": "建議訂位", "mapQuery": "松尾ジンギスカン 札幌" },
        { "name": "JAPANESE BUFFET DINING 伝 (DEN)", "note": "三大蟹吃到飽，適合多人", "mapQuery": "伝 DEN 札幌" },
        { "name": "蝦蟹合戰", "note": "螃蟹吃到飽", "mapQuery": "えびかに合戦 札幌" }
      ]
    },
    "dinner2": {
      "area": "狸小路附近",
      "picks": [
        { "name": "Soup Curry GARAKU 本店", "note": "湯咖哩名店", "mapQuery": "GARAKU 湯咖哩 札幌" },
        { "name": "シハチ鮮魚店 狸COMICHI店", "note": "新鮮海鮮", "mapQuery": "シハチ鮮魚店 狸COMICHI" },
        { "name": "札幌赤星拉麵", "note": "特色拉麵", "mapQuery": "赤星 ラーメン 札幌" }
      ]
    }
  },
  "7": {
    "lunch": {
      "area": "札幌車站 Stellar Place",
      "picks": [
        { "name": "根室花丸 迴轉壽司", "note": "非常熱門！建議 11:00 前抽號碼牌", "tag": "推薦", "mapQuery": "根室花まる JRタワーステラプレイス店" }
      ]
    },
    "dinner": {
      "area": "札幌車站周邊",
      "picks": [
        { "name": "蟹本家", "note": "精緻螃蟹會席", "tag": "推薦", "mapQuery": "かに本家 札幌駅前本店" }
      ]
    }
  },
  "8": {
    "lunch": {
      "area": "新千歲機場國內線 3F",
      "picks": [
        { "name": "拉麵道場 (一幻鮮蝦拉麵)", "note": "機場最後一碗拉麵！", "tag": "推薦", "mapQuery": "北海道ラーメン道場 新千歳空港" },
        { "name": "Royce 巧克力世界", "note": "試吃 + 購買生巧克力", "mapQuery": "ロイズチョコレートワールド 新千歳空港" },
        { "name": "LeTAO 機場店", "note": "起司蛋糕點心", "mapQuery": "ルタオ 新千歳空港" }
      ]
    }
  }
};
