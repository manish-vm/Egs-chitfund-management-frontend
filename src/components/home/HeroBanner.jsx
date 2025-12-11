import React, { useEffect, useState } from 'react';
import '../../css/home.css'; 
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'MetroMensWear',
    subtitle: 'Fresh fits for metro men – tees you’ll live in.',
    ctaPrimaryLabel: 'Shop T-Shirts',
    ctaPrimaryLink: '/category/men',
    ctaSecondaryLabel: 'New Arrivals',
    ctaSecondaryLink: '/products?new=true',
    image:
      'https://a.storyblok.com/f/165154/1280x720/9bcbd5f298/01_t-shirt-advertisement-strategies-header.jpg/m/'
  },
  {
    id: 2,
    title: 'Winter Layers Sorted',
    subtitle: 'Hoodies, sweatshirts and jackets built for cold commutes.',
    ctaPrimaryLabel: 'Shop Winterwear',
    ctaPrimaryLink: '/category/winterwear',
    ctaSecondaryLabel: 'Best Sellers',
    ctaSecondaryLink: '/products?bestseller=true',
    image:
      'https://www.gazman.com.au/cdn/shop/articles/HowToStyleSweaters_Blog_Winter_FeatureTile_1016x711_1_480x.jpg?v=1720586005'
  },
  {
    id: 3,
    title: 'Oversized Street Fits',
    subtitle: 'Relaxed silhouettes, clean graphics, all-day comfort.',
    ctaPrimaryLabel: 'Shop Oversized',
    ctaPrimaryLink: '/category/oversized',
    ctaSecondaryLabel: 'Printed Tees',
    ctaSecondaryLink: '/category/printed',
    image:
      'https://cdn.shopify.com/s/files/1/1982/7331/files/984_588_copy_2.png?v=1742922172'
  },
  {
    id: 4,
    title: 'Denim Jeans',
    subtitle: 'Mens Denim Jeans for Everyday Adventures',
    ctaPrimaryLabel: 'Shop Denim',
    ctaPrimaryLink: '/category/Denim',
    ctaSecondaryLabel: 'Denim Jeans',
    ctaSecondaryLink: '/category/Denim',
    image:
      'https://www.tistabene.com/cdn/shop/articles/WhatsApp_Image_2024-01-05_at_5.38.40_PM.jpg?v=1704458187'
  }
];

const AUTO_SLIDE_MS = 3000;

const HeroBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_MS);

    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => {
    setActiveIndex(index);
  };


  return (
    <section className="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === activeIndex ? 'active' : ''
            }`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-overlay" />

          <div className="hero-content">
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
            <div className="hero-cta">
              <button
                onClick={() => navigate(slide.ctaPrimaryLink)}
                className="btn-one"
              >
                {slide.ctaPrimaryLabel}
              </button>

              <button
                onClick={() => navigate(slide.ctaSecondaryLink)}
                className="btn-two"
              >
                {slide.ctaSecondaryLabel}
              </button>
            </div>

          </div>
        </div>
      ))}


      {/* Dots */}
      <div className="hero-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={
              'hero-dot' + (index === activeIndex ? ' active' : '')
            }
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
