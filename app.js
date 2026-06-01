const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ОПРЕДЕЛЯЕМ ПРАВИЛЬНУЮ ДИРЕКТОРИЮ ДЛЯ СОХРАНЕНИЯ ФАЙЛОВ
// В исполняемом файле process.execPath показывает путь к .exe
// В обычном режиме - __dirname показывает папку с скриптом
const getAppDirectory = () => {
    if (process.pkg) {
        // Запущено из скомпилированного .exe файла
        return path.dirname(process.execPath);
    } else {
        // Запущено из Node.js напрямую
        return __dirname;
    }
};

const APP_DIR = getAppDirectory();

console.log('=' .repeat(60));
console.log('🏗️  СИСТЕМА ФОРМИРОВАНИЯ ЗАЯВОК НА СТРОЙМАТЕРИАЛЫ');
console.log('=' .repeat(60));
console.log(`📁 Рабочая директория: ${APP_DIR}`);
console.log('=' .repeat(60));

// ========== ДАННЫЕ ==========
const REGIONS = {
  1: { name: 'Санкт-Петербург', code: 'SPB' },
  2: { name: 'Москва', code: 'MSC' },
  3: { name: 'Краснодар', code: 'KRD' }
};

const MATERIALS = [
  { id: 1, name: 'Утеплитель Роквул Скандик 50 мм', category: 'Утеплитель', price: { SPB: 1075, MSC: 1100, KRD: 950 } },
  { id: 2, name: 'Утеплитель Кнауф ТеплоКНАУФ 50 мм', category: 'Утеплитель', price: { SPB: 860, MSC: 900, KRD: 1300 } },
  { id: 3, name: 'Газобетон СК D400 100х250х625 мм', category: 'Газобетон', price: { SPB: 450, MSC: 430, KRD: 420 } },
  { id: 4, name: 'Газобетон ЛСР D400 100х250х625 мм', category: 'Газобетон', price: { SPB: 580, MSC: 550, KRD: 580 } },
  { id: 5, name: 'Пеноплекс Комфорт 50 мм', category: 'Утеплитель', price: { SPB: 1200, MSC: 1250, KRD: 1100 } },
  { id: 6, name: 'Кирпич керамический пустотелый М150', category: 'Кирпич', price: { SPB: 15, MSC: 16, KRD: 14 } },
  { id: 7, name: 'Кирпич силикатный полнотелый М150', category: 'Кирпич', price: { SPB: 12, MSC: 13, KRD: 11 } },
  { id: 8, name: 'Цемент М500 (50 кг)', category: 'Цемент', price: { SPB: 350, MSC: 360, KRD: 330 } },
  { id: 9, name: 'Цемент М400 (50 кг)', category: 'Цемент', price: { SPB: 320, MSC: 330, KRD: 300 } },
  { id: 10, name: 'Гипсокартон Кнауф 2500х1200х12.5 мм', category: 'Гипсокартон', price: { SPB: 550, MSC: 570, KRD: 520 } },
  { id: 11, name: 'Гипсокартон Волма 2500х1200х12.5 мм', category: 'Гипсокартон', price: { SPB: 530, MSC: 550, KRD: 500 } },
  { id: 12, name: 'Арматура 12 мм А500С', category: 'Металл', price: { SPB: 85, MSC: 88, KRD: 80 } },
  { id: 13, name: 'Арматура 14 мм А500С', category: 'Металл', price: { SPB: 95, MSC: 98, KRD: 90 } }
];

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function getPrice(material, regionCode) {
  return material.price[regionCode];
}

function getCheapestInCategory(category, regionCode) {
  const materialsInCategory = MATERIALS.filter(m => m.category === category);
  if (materialsInCategory.length === 0) return null;
  
  return materialsInCategory.reduce((cheapest, current) => {
    const cheapestPrice = getPrice(cheapest, regionCode);
    const currentPrice = getPrice(current, regionCode);
    return currentPrice < cheapestPrice ? current : cheapest;
  });
}

function saveOrderToJSON(orderData) {
  // Используем APP_DIR для сохранения файла
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `order_${timestamp}.json`;
  const filepath = path.join(APP_DIR, filename);
  
  try {
    fs.writeFileSync(filepath, JSON.stringify(orderData, null, 2), 'utf8');
    console.log(`\n✅ Заявка сохранена в файл: ${filepath}`);
    console.log(`📁 Папка: ${APP_DIR}`);
    return filepath;
  } catch (error) {
    console.error(`\n❌ Ошибка сохранения файла: ${error.message}`);
    console.log(`💡 Попробуйте запустить программу от имени администратора`);
    return null;
  }
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========
async function selectRegion(rl) {
  console.log('\n=== ВЫБОР РЕГИОНА ===');
  for (const [key, region] of Object.entries(REGIONS)) {
    console.log(`${key}. ${region.name}`);
  }
  
  while (true) {
    const choice = await question(rl, '\nВыберите регион (1-3): ');
    if (REGIONS[choice]) {
      return REGIONS[choice];
    }
    console.log('❌ Неверный выбор. Попробуйте снова.');
  }
}

async function selectMaterial(rl, region) {
  console.log(`\n=== ДОСТУПНЫЕ МАТЕРИАЛЫ (${region.name}) ===`);
  console.log('ID | Наименование'.padEnd(50) + '| Цена');
  console.log('-' .repeat(70));
  
  MATERIALS.forEach(material => {
    const price = getPrice(material, region.code);
    const nameDisplay = `${material.id}. ${material.name}`.padEnd(50);
    console.log(`${nameDisplay} | ${price} ₽`);
  });
  
  while (true) {
    const input = await question(rl, '\nВведите ID товара: ');
    const id = parseInt(input);
    const selected = MATERIALS.find(m => m.id === id);
    
    if (selected) {
      return selected;
    }
    console.log('❌ Неверный ID товара. Попробуйте снова.');
  }
}

async function offerAlternative(rl, selectedMaterial, region) {
  const category = selectedMaterial.category;
  const currentPrice = getPrice(selectedMaterial, region.code);
  
  const cheapestMaterial = getCheapestInCategory(category, region.code);
  const cheapestPrice = getPrice(cheapestMaterial, region.code);
  
  console.log('\n=== ПРЕДЛОЖЕНИЕ УДЕРЖАНИЯ КЛИЕНТА ===');
  
  if (cheapestMaterial.id !== selectedMaterial.id) {
    console.log(`💰 Мы нашли более дешевый аналог в категории "${category}":`);
    console.log(`   📦 ${cheapestMaterial.name}`);
    console.log(`   💵 Цена: ${cheapestPrice} ₽ (экономия ${currentPrice - cheapestPrice} ₽)`);
    
    const answer = await question(rl, '\nХотите заменить товар на более дешевый? (y/n): ');
    
    if (answer.toLowerCase() === 'y') {
      console.log(`\n✅ Товар заменен на: ${cheapestMaterial.name} (${cheapestPrice} ₽)`);
      return { material: cheapestMaterial, price: cheapestPrice, discountApplied: false };
    }
  } else {
    const discountedPrice = Math.round(currentPrice * 0.95);
    const savings = currentPrice - discountedPrice;
    
    console.log(`✨ Ваш товар уже самый выгодный в категории "${category}"!`);
    console.log(`🎁 Мы предоставляем скидку 5%:`);
    console.log(`   📦 ${selectedMaterial.name}`);
    console.log(`   💵 Было: ${currentPrice} ₽`);
    console.log(`   💵 Стало: ${discountedPrice} ₽ (экономия ${savings} ₽)`);
    
    const answer = await question(rl, '\nПринять предложение со скидкой? (y/n): ');
    
    if (answer.toLowerCase() === 'y') {
      console.log(`\n✅ Скидка применена! Новая цена: ${discountedPrice} ₽`);
      return { material: selectedMaterial, price: discountedPrice, discountApplied: true };
    }
  }
  
  console.log(`\n✅ Оставлен товар: ${selectedMaterial.name} (${currentPrice} ₽)`);
  return { material: selectedMaterial, price: currentPrice, discountApplied: false };
}

async function confirmOrder(rl, material, region, finalPrice, discountApplied) {
  console.log('\n=== ИТОГОВАЯ ЗАЯВКА ===');
  console.log(`🌍 Регион: ${region.name}`);
  console.log(`📦 Товар: ${material.name}`);
  console.log(`🏷️  Категория: ${material.category}`);
  console.log(`💰 Цена: ${finalPrice} ₽`);
  if (discountApplied) {
    console.log(`🎉 Применена скидка 5%`);
  }
  
  const answer = await question(rl, '\nОформляем заявку? (y/n): ');
  
  if (answer.toLowerCase() === 'y') {
    const orderData = {
      timestamp: new Date().toISOString(),
      region: region.name,
      regionCode: region.code,
      material: {
        id: material.id,
        name: material.name,
        category: material.category,
        originalPrice: getPrice(material, region.code),
        finalPrice: finalPrice,
        discountApplied: discountApplied
      }
    };
    
    saveOrderToJSON(orderData);
    console.log('\n🎉 Спасибо за заказ!');
    return true;
  } else {
    console.log('\n❌ Заказ отменен.');
    return false;
  }
}

// ========== ГЛАВНАЯ ФУНКЦИЯ ==========
async function main() {
  const rl = createInterface();
  
  try {
    // 1. Выбор региона
    const region = await selectRegion(rl);
    
    // 2. Выбор товара
    const selectedMaterial = await selectMaterial(rl, region);
    
    // 3. Показ текущего заказа
    const currentPrice = getPrice(selectedMaterial, region.code);
    console.log('\n=== ТЕКУЩИЙ ЗАКАЗ ===');
    console.log(`📦 ${selectedMaterial.name}`);
    console.log(`💰 ${currentPrice} ₽`);
    
    // 4. Спросить об оформлении
    const immediateAnswer = await question(rl, '\nОформляем заявку? (y/n): ');
    
    let finalMaterial = selectedMaterial;
    let finalPrice = currentPrice;
    let discountApplied = false;
    
    if (immediateAnswer.toLowerCase() === 'y') {
      // Сразу оформляем
      const orderData = {
        timestamp: new Date().toISOString(),
        region: region.name,
        regionCode: region.code,
        material: {
          id: selectedMaterial.id,
          name: selectedMaterial.name,
          category: selectedMaterial.category,
          originalPrice: currentPrice,
          finalPrice: currentPrice,
          discountApplied: false
        }
      };
      saveOrderToJSON(orderData);
      console.log('\n🎉 Спасибо за заказ!');
    } else {
      // Запускаем логику удержания
      console.log('\n🔄 Ищем лучшие условия для вас...');
      const alternative = await offerAlternative(rl, selectedMaterial, region);
      finalMaterial = alternative.material;
      finalPrice = alternative.price;
      discountApplied = alternative.discountApplied;
      
      await confirmOrder(rl, finalMaterial, region, finalPrice, discountApplied);
    }
    
    console.log('\nНажмите Enter для выхода...');
    await question(rl, '');
    
  } catch (error) {
    console.error('❌ Произошла ошибка:', error.message);
    console.log('\nНажмите Enter для выхода...');
    await question(rl, '');
  } finally {
    rl.close();
  }
}

// Запуск приложения
main().catch(console.error);