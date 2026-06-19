import fs from 'fs';
import path from 'path';
import { productList } from '../data/products';

// Light-weight manual .env loader for CLI execution
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const parts = trimmed.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
                    process.env[key] = value;
                }
            }
        });
    }
} catch (err) {
    console.warn('Could not manually parse .env file:', err);
}

function cleanPrice(priceStr?: string): string {
    if (!priceStr) return '100.00 INR';
    // Match the first number in the string (e.g. ₹200 - ₹600 => 200)
    const match = priceStr.replace(/,/g, '').match(/\d+/);
    if (match) {
        return `${match[0]}.00 INR`;
    }
    return '100.00 INR';
}

function getGoogleCategory(category?: string): string {
    if (!category) return 'Health & Beauty > Health Care';
    const cat = category.toLowerCase();
    if (cat.includes('baby food') || cat.includes('infant')) {
        return 'Food, Beverages & Tobacco > Food Items > Baby & Toddler Food';
    }
    if (cat.includes('hydration') || cat.includes('energy') || cat.includes('nutrition')) {
        return 'Health & Beauty > Health Care > Fitness & Nutrition';
    }
    if (cat.includes('oral care')) {
        return 'Health & Beauty > Personal Care > Oral Care';
    }
    if (cat.includes('skin') || cat.includes('body') || cat.includes('personal')) {
        return 'Health & Beauty > Personal Care';
    }
    return 'Health & Beauty > Health Care';
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

function generateRssFeed() {
    console.log('Generating Google Merchant RSS Feed...');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>New Lucky Pharma Products</title>
    <link>https://newluckypharma.vercel.app</link>
    <description>Google Merchant Feed for New Lucky Pharma - Quality healthcare and medicine products.</description>
`;

    for (const prod of productList) {
        const id = prod.id;
        const title = escapeXml(prod.name);
        // Trim/clean description
        const desc = escapeXml(prod.description || `${prod.name} - high quality pharmaceutical product from New Lucky Pharma.`);
        const link = `https://newluckypharma.vercel.app/?product_id=${id}`;
        
        // Use placeholder or backup image if none exists
        const imgLink = escapeXml(prod.image || 'https://newluckypharma.vercel.app/images/default-product.jpg');
        const price = cleanPrice(prod.avgPrice);
        const googleCat = escapeXml(getGoogleCategory(prod.category));
        const availability = 'in_stock';
        const condition = 'new';
        
        // Default brand
        const brand = escapeXml(prod.category === 'Baby Food' ? 'Nestle' : 'New Lucky Pharma');

        xml += `    <item>
      <g:id>${id}</g:id>
      <title>${title}</title>
      <description>${desc}</description>
      <link>${link}</link>
      <g:image_link>${imgLink}</g:image_link>
      <g:price>${price}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:brand>${brand}</g:brand>
      <g:google_product_category>${googleCat}</g:google_product_category>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Local Delivery</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>
`;
    }

    xml += `  </channel>
</rss>
`;

    const outputPath = path.resolve(process.cwd(), 'public/google-merchant-feed.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    console.log(`Successfully generated Google Merchant RSS feed with ${productList.length} products at: ${outputPath}`);
}

function generateSitemap() {
    console.log('Generating Sitemap XML for SEO and Crawford Mapping...');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://newluckypharma.vercel.app/</loc>
    <lastmod>2026-06-18</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    for (const prod of productList) {
        xml += `  <url><loc>https://newluckypharma.vercel.app/?product_id=${prod.id}</loc><lastmod>2026-06-18</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }

    xml += `</urlset>\n`;

    const outputPath = path.resolve(process.cwd(), 'public/sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    console.log(`Successfully generated sitemap.xml with ${productList.length} products at: ${outputPath}`);
}

function generateLocalInventoryFeed() {
    console.log('Generating Google Merchant Local Product Inventory Feed...');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>New Lucky Pharma - Local Product Inventory</title>
    <link>https://newluckypharma.vercel.app</link>
    <description>Local inventory and stock details for New Lucky Pharma physical store.</description>
`;

    for (const prod of productList) {
        const id = prod.id;
        const price = cleanPrice(prod.avgPrice);
        
        // Use process.env.GOOGLE_STORE_CODE or fallback to '103' if not defined (matches registered Shop Code in Google Business Profile)
        const storeCode = process.env.GOOGLE_STORE_CODE || '103';
        const quantity = 15; // Set inventory stock quantity to 15 (as requested 'quantities 10 or something')
        const availability = 'in_stock';

        xml += `    <item>
      <g:item_id>${id}</g:item_id>
      <g:store_code>${storeCode}</g:store_code>
      <g:quantity>${quantity}</g:quantity>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
    </item>
`;
    }

    xml += `  </channel>
</rss>
`;

    const outputPath = path.resolve(process.cwd(), 'public/google-local-inventory-feed.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    console.log(`Successfully generated Google Merchant Local Inventory Feed with ${productList.length} items at: ${outputPath}`);
}

generateRssFeed();
generateSitemap();
generateLocalInventoryFeed();
