import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/home.css';

const categoryTiles = [
  {
    key: 'shirts',
    label: 'SHIRTS',
    link: '/category/shirts',
    image:
      'https://thefoomer.in/cdn/shop/products/jpeg-optimizer_PATP5153.jpg?v=1680162712'
  },
  {
    key: 'trousers',
    label: 'TROUSERS',
    link: '/products?subCategory=Trousers',
    image:
      'https://5.imimg.com/data5/QW/FN/MY-47031181/mens-formal-trouser-500x500.jpg'
  },
  {
    key: 'winterwear',
    label: 'WINTERWEAR',
    link: '/category/winterwear',
    image:
      'https://media.istockphoto.com/id/1288189469/photo/one-handosme-man-dressed-in-warm-winter-clothing-walking-outdoors-in-the-city.jpg?s=612x612&w=0&k=20&c=HcKQwj_B2VMG8zDTxUuy3vlhYzM5WmsbqS2SkZpkVkk='
  },
  {
    key: 'cargos',
    label: 'CARGOS',
    link: '/products?subCategory=Cargo%20Pants',
    image:
      'https://i.pinimg.com/236x/64/08/ff/6408ff4371be0eb672ab24ce651ce77e.jpg'
  },
  {
    key: 'polos',
    label: 'POLOS',
    link: '/products?subCategory=Polo%20T-Shirts',
    image:
      'https://img.freepik.com/free-photo/young-smiling-handsome-fashionable-man-with-stylish-haircut-sunglasses-dressed-black-t-shirt-pants-standing-modern-city-against-skyscraper_613910-6145.jpg?semt=ais_hybrid&w=740&q=80'
  },
  {
    key: 'jeans',
    label: 'JEANS',
    link: '/products?subCategory=Jeans',
    image:
      'https://i.pinimg.com/564x/7a/a7/50/7aa750e020f461c3f7df3d144d842011.jpg'
  },
  {
    key: 'joggers',
    label: 'JOGGERS',
    link: '/products?subCategory=Joggers',
    image:
      'https://assets.sheinindia.in/medias/shein_sys_master/root/20250524/FEKU/6831c3587a6cd4182f4c6779/-1117Wx1400H-443315956-black-MODEL.jpg'
  },
  {
    key: 'oversized',
    label: 'OVERSIZED',
    link: '/category/oversized',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtmkrOq6Uw1UoEL474Pobq2LZW_YMnHg5ZiA&s'
  },
  {
    key: 'printed',
    label: 'PRINTED',
    link: '/category/printed',
    image:
      'https://i.pinimg.com/736x/8b/14/da/8b14da593e1db345373ab62ae191edc2.jpg'
  },
  {
    key: 'plain-tees',
    label: 'PLAIN',
    link: '/products?subCategory=Plain%20T-Shirts',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4GEQDBZzaf0eAV0HzdsA-0WUPQhhU_wW7hA&s'
  }
];

const CategoryStrip = () => {
  return (
    <section className="category-strip">
      <div className="category-strip-header">
        <h2>MOST-WANTED CATEGORIES</h2>
        <p>Loved by all, selling out fast</p>
      </div>

      <div className="category-strip-grid">
        {categoryTiles.map((tile) => (
          <Link
            key={tile.key}
            to={tile.link}
            className="category-card"
          >
            <div
              className="category-card-bg"
              style={{ backgroundImage: `url(${tile.image})` }}
            >
              <div className="category-card-bottom">
                <span className="category-card-accent" />
                <span className="category-card-label">
                  {tile.label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryStrip;
