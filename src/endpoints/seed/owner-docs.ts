import type { Payload, RequiredDataFromCollectionSlug } from 'payload'
import {
  createBulletList,
  createHeading,
  createNumberedList,
  createParagraph,
  createRichText,
} from '@/utilities/lexicalHelpers'

type Doc = RequiredDataFromCollectionSlug<'documentation'>

export const OWNER_DOCS: Doc[] = [
  // ─────────────────────────────────────────────
  // 1. Welcome & Orientation
  // ─────────────────────────────────────────────
  {
    title: 'Welcome to Your Dashboard',
    slug: 'welcome-to-candera',
    order: 1,
    category: 'CMS Usage',
    content: createRichText([
      createParagraph(
        'This is your Candera admin dashboard — the place where you manage everything on your website, from candle listings to journal posts to the homepage layout.',
      ),
      createParagraph(
        'You do not need any technical knowledge to use it. This guide and the articles below will walk you through every area step by step.',
      ),
      createHeading('How the dashboard is organised', 'h2'),
      createParagraph(
        'On the left side of the screen you will see a menu. It is split into two types of areas:',
      ),
      createBulletList(
        'Collections — these are lists of things you can create, edit, and delete. Products, journal posts, media images, and quiz content are all collections.',
        'Globals — these are single settings pages that control site-wide things like your navigation menu and footer.',
      ),
      createHeading('Your collections at a glance', 'h2'),
      createBulletList(
        'Pages — the content on pages like your homepage, about page, and contact page',
        'Products — your candle listings',
        'Posts — journal articles that appear in your blog',
        'Media — all images and files you have uploaded',
        'Categories — labels used to group products and posts',
        'Quizzes — the scent quiz questions and answer options',
        'Scent Profiles — the results that the scent quiz recommends (e.g. "Intimate", "Meadowlight")',
        'Briefs — AI-generated content briefs for product pages, not visible to visitors',
        'Users — admin accounts that can log in to this dashboard',
      ),
      createHeading('Your globals at a glance', 'h2'),
      createBulletList(
        'Header — your site navigation links',
        'Footer — your footer links and text',
        'Site Theme — your brand colours and visual settings',
      ),
      createHeading('Where to start', 'h2'),
      createParagraph(
        'If you are new, the best first step is to open Products and review your candle listings. Then check the Header global to make sure your navigation links are correct.',
      ),
      createParagraph(
        'Each article in this documentation section covers one area in detail. You can read them in order or jump to the one you need.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 2. Draft vs Published
  // ─────────────────────────────────────────────
  {
    title: 'Drafts, Publishing, and Saving',
    slug: 'drafts-and-publishing',
    order: 2,
    category: 'Publishing Workflow',
    content: createRichText([
      createParagraph(
        'Every piece of content in your dashboard — products, posts, and pages — can exist in one of two states: Draft or Published.',
      ),
      createHeading('What draft means', 'h2'),
      createParagraph(
        'A draft is saved but invisible to visitors on your live website. You can edit it freely without anything changing on the public site. Use drafts when you are working on something that is not ready yet.',
      ),
      createHeading('What published means', 'h2'),
      createParagraph(
        'A published item is live on your website and visible to anyone who visits. When you publish something, it goes live immediately.',
      ),
      createHeading('How to save a draft', 'h2'),
      createNumberedList(
        'Open the item you want to edit (for example, a product)',
        'Make your changes',
        'Click the "Save Draft" button in the top-right corner',
        'Your changes are saved but the live site is unchanged',
      ),
      createHeading('How to publish', 'h2'),
      createNumberedList(
        'Open the item you want to publish',
        'Make sure everything looks correct',
        'Click the "Publish" button in the top-right corner',
        'The item is now live on your website',
      ),
      createHeading('How to preview before publishing', 'h2'),
      createParagraph(
        'On products and posts, you will see a "Preview" button near the top of the edit screen. Click it to open a live preview of the page as it will appear to visitors — before you publish. You can switch between Mobile, Tablet, and Desktop views using the buttons at the top of the preview panel.',
      ),
      createHeading('Unpublishing something', 'h2'),
      createParagraph(
        'To take something off your live site without deleting it, open the item and change its status back to Draft using the status dropdown in the top-right area, then save. It will disappear from the public site but remain in your dashboard.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 3. Managing Pages (with 10-block refinement)
  // ─────────────────────────────────────────────
  {
    title: 'Editing Your Pages',
    slug: 'managing-pages',
    order: 3,
    category: 'CMS Usage',
    content: createRichText([
      createParagraph(
        'Your website has several static pages — the homepage, about page, contact page, and others. You can edit all of them from the Pages collection.',
      ),
      createHeading('How to edit a page', 'h2'),
      createNumberedList(
        'Click "Pages" in the left menu',
        'Click on the page you want to edit (for example, "Home")',
        'The page will open in an editor with a list of sections called "layout blocks"',
        'Click on any block to expand it and edit the text, images, or settings inside',
        'When you are done, click "Save Draft" to save without publishing, or "Publish" to make your changes live',
      ),
      createHeading('The homepage', 'h2'),
      createParagraph(
        'The homepage is made up of several blocks stacked on top of each other. Each block controls one section of the page:',
      ),
      createBulletList(
        'Storefront Hero — the large opening section with the headline, sub-line, and main call-to-action buttons',
        'The Vessels — the showcase row of featured candle vessels',
        'Call To Action — a standalone prompt with a button (for example, "Shop the collection")',
        'Content — flexible rich-text columns for free-form writing and images',
        'Media Block — a single image or video band across the page',
        'Archive — the product grid or journal grid section',
        'Form — an embedded form such as a contact or sign-up form',
        'Testimonials — the customer quote section',
        'Inner Circle CTA — the email sign-up section',
        'Scent Quiz — the "Find Your Scent" section and quiz trigger',
      ),
      createHeading('Editing the homepage headline', 'h2'),
      createNumberedList(
        'Open Pages and click "Home"',
        'Scroll down to the Layout section and find the "Storefront Hero" block',
        'Click to expand it',
        'Edit the "Headline" and "Subheading" fields',
        'Click Publish when done',
      ),
      createHeading('Adding or removing blocks', 'h2'),
      createParagraph(
        'You can reorder blocks by dragging the handle on the left side of each block. To remove a block, click the three-dot menu on the right side and select "Remove". To add a new block, scroll to the bottom of the layout and click "Add Block", then choose the block type.',
      ),
      createParagraph(
        'Be careful when removing blocks — there is no undo. If you accidentally remove a block, do not save, and refresh the page to restore it.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 4. Managing Products
  // ─────────────────────────────────────────────
  {
    title: 'Managing Your Products',
    slug: 'managing-products',
    order: 4,
    category: 'CMS Usage',
    content: createRichText([
      createParagraph(
        'Your candle listings live in the Products collection. From here you can add new candles, update descriptions and prices, manage images, and control what appears on your live store.',
      ),
      createHeading('How to edit an existing product', 'h2'),
      createNumberedList(
        'Click "Products" in the left menu',
        'Find the product you want to edit and click on it',
        'The product editor will open with two tabs across the top: Content and SEO',
        'Edit the fields you want to change',
        'Click "Save Draft" to save without publishing, or "Publish" to go live',
      ),
      createHeading('What each tab contains', 'h2'),
      createBulletList(
        'Content — the product title, tagline, price, main description, and hero image. Scroll down within this tab for two more sections: Scent Profile (the scent notes, burn time, wax type, and botanical details) and Specifications (vessel size, weight, and other details)',
        'SEO — the title and description that appear in Google search results',
      ),
      createHeading('How to add a new product', 'h2'),
      createNumberedList(
        'Click "Products" in the left menu',
        'Click the "Create New" button in the top-right corner',
        'Fill in the Title field first — this is the candle name',
        'Fill in the Slug field — this becomes the web address piece (e.g. "wild-lilac" becomes canderacandles.com/products/wild-lilac)',
        'Fill in the remaining fields across the tabs',
        'Add a product image in the Content tab by clicking the image upload area',
        'Set the status to Draft while you work, then Publish when ready',
      ),
      createHeading('How to add a product image', 'h2'),
      createNumberedList(
        'Open the product and go to the Content tab',
        'Click the image upload area or the "Choose from Media" button',
        'Either upload a new image from your computer, or select one you have already uploaded',
        'Click "Select" to attach it to the product',
      ),
      createHeading('Taking a product off the site temporarily', 'h2'),
      createParagraph(
        'Change the product status from Published to Draft and save. It will disappear from your store but remain in your dashboard. Publish it again whenever you are ready.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 5. Writing Journal Posts
  // ─────────────────────────────────────────────
  {
    title: 'Writing Journal Posts',
    slug: 'writing-posts',
    order: 5,
    category: 'Publishing Workflow',
    content: createRichText([
      createParagraph(
        'Your journal is where you share stories, rituals, behind-the-scenes writing, and anything else you want to say. Posts live in the Posts collection.',
      ),
      createHeading('How to write a new post', 'h2'),
      createNumberedList(
        'Click "Posts" in the left menu',
        'Click "Create New" in the top-right corner',
        'Enter a title for your post',
        'Add a hero image — this appears at the top of the post and in journal listings',
        'Write your content in the large text area below',
        'Fill in the SEO tab with a search-friendly title and description',
        'Save as Draft while you write, then Publish when ready',
      ),
      createHeading('Using the text editor', 'h2'),
      createParagraph(
        'The text editor works like a simple word processor. You can type directly into it. To format text, select it with your mouse — a toolbar will appear with options for bold, italic, headings, links, and bullet lists.',
      ),
      createParagraph(
        'To add an image inside your post, click the "+" icon that appears on a new blank line, then choose "Image" from the menu that appears. You can upload a new image or choose one from your media library.',
      ),
      createHeading('Adding categories', 'h2'),
      createParagraph(
        'Categories help visitors find related posts. To add one, scroll down to the "Categories" field on the post editor and select from the available options. You can manage your categories from the Categories collection in the left menu.',
      ),
      createHeading('Editing an existing post', 'h2'),
      createNumberedList(
        'Click "Posts" in the left menu',
        'Click on the post you want to edit',
        'Make your changes',
        'Click "Publish" — the updated version goes live immediately',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 6. Uploading and Managing Media
  // ─────────────────────────────────────────────
  {
    title: 'Uploading and Managing Images',
    slug: 'managing-media',
    order: 6,
    category: 'CMS Usage',
    content: createRichText([
      createParagraph(
        'All images and files on your site are stored in the Media collection. You can upload new images here and then attach them to products, posts, or pages.',
      ),
      createHeading('How to upload a new image', 'h2'),
      createNumberedList(
        'Click "Media" in the left menu',
        'Click "Create New" in the top-right corner',
        'Click the upload area, or drag and drop an image file from your computer',
        'Fill in the "Alt Text" field — this is a short description of the image (for example, "Wild Lilac candle on a marble surface")',
        'Click "Save" to finish',
      ),
      createHeading('What is alt text and why does it matter', 'h2'),
      createParagraph(
        'Alt text is a short description you attach to every image. It is used by search engines to understand what the image shows, and by screen readers for visitors with visual impairments. Always fill it in — it helps your site appear in Google image search results.',
      ),
      createHeading('Organising images into folders', 'h2'),
      createParagraph(
        'The Media collection supports folders. You can create folders to keep your images organised — for example, one folder for product photos and another for journal images. To move an image into a folder, open the image, find the "Folder" field, and select the folder you want.',
      ),
      createHeading('How to attach an image to a product or post', 'h2'),
      createParagraph(
        'You do not attach images from the Media collection directly. Instead, open the product or post you want to edit, find the image field, and click "Choose from Media". A browser will open showing your uploaded images — click the one you want and click "Select".',
      ),
      createHeading('Image size recommendations', 'h2'),
      createBulletList(
        'Product images: at least 1200 × 1200 pixels, square format works best',
        'Post hero images: at least 1600 × 900 pixels, landscape format',
        'File format: JPG or WebP for photos, PNG for images with transparent backgrounds',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 7. Navigation and Footer
  // ─────────────────────────────────────────────
  {
    title: 'Editing Your Navigation and Footer',
    slug: 'navigation-and-footer',
    order: 7,
    category: 'Design & Theming',
    content: createRichText([
      createParagraph(
        'Your site navigation (the links at the top of every page) and your footer are controlled by Globals. Globals are site-wide settings — there is only one of each, and changes apply everywhere immediately.',
      ),
      createHeading('How to edit your navigation', 'h2'),
      createNumberedList(
        'Click "Header" under the Globals section in the left menu',
        'You will see a list of navigation links',
        'To edit a link, click on it and change the label or destination URL',
        'To add a new link, click "Add Link" at the bottom of the list',
        'To remove a link, click the remove icon next to it',
        'Click "Save" when done — changes go live immediately, there is no draft mode for globals',
      ),
      createHeading('How to edit your footer', 'h2'),
      createNumberedList(
        'Click "Footer" under the Globals section in the left menu',
        'Edit the links and text in the footer sections',
        'Click "Save" when done',
      ),
      createHeading('Important: globals have no draft mode', 'h2'),
      createParagraph(
        'Unlike products and posts, globals do not have a Draft state. When you click Save, the change goes live on your site immediately. Double-check your changes before saving.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 8. Brand Look (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Your Brand Look: Theme & Studio Info',
    slug: 'brand-look-settings',
    order: 8,
    category: 'Design & Theming',
    content: createRichText([
      createParagraph(
        'Two settings pages control how your site looks and the studio details shown to visitors: Site Theme and Studio Info. Both are Globals — there is only one of each, and saving applies the change everywhere immediately.',
      ),
      createHeading('Changing your brand colours and fonts', 'h2'),
      createNumberedList(
        'Click "Site Theme" under the Globals section in the left menu',
        'Adjust the colour and font options shown',
        'Use the theme preset switcher near the top to try a ready-made look, or fine-tune individual values',
        'Click "Save" — the change goes live on your site immediately',
      ),
      createHeading('Updating your studio details', 'h2'),
      createNumberedList(
        'Click "Studio Info" under the Globals section in the left menu',
        'Edit the studio name, contact details, and any other fields shown',
        'Click "Save" when done',
      ),
      createHeading('Important: settings go live instantly', 'h2'),
      createParagraph(
        'Like your navigation and footer, these settings pages have no Draft state. When you click Save, the change is live right away — so double-check before saving.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 9. Scent Quiz (was order 8)
  // ─────────────────────────────────────────────
  {
    title: 'Managing the Scent Quiz',
    slug: 'managing-scent-quiz',
    order: 9,
    category: 'CMS Usage',
    content: createRichText([
      createParagraph(
        'The scent quiz helps visitors find the right candle for them. It is made up of two parts: the Quiz (the questions and answer options) and the Scent Profiles (the results the quiz recommends).',
      ),
      createHeading('Editing the quiz questions', 'h2'),
      createNumberedList(
        'Click "Quizzes" in the left menu',
        'Click on "Candera Scent Ritual Quiz"',
        'You will see a list of questions — click any question to expand it and edit the prompt text',
        'Each question has a list of answer options — click an option to edit its label',
        'Each option has scores that point to a scent profile — these control which result the quiz recommends based on answers',
        'Click "Save" when done',
      ),
      createHeading('Editing the quiz results (Scent Profiles)', 'h2'),
      createNumberedList(
        'Click "Scent Profiles" in the left menu',
        'Click on the profile you want to edit (for example, "Intimate")',
        'You can edit the profile name, the editorial quote that appears on the result screen, and the botanical composition notes',
        'You can also change the "Featured Product" — this is the candle the quiz recommends for this profile',
        'The "Ambient Image" is the background image that fades in when this result appears',
        'Click "Save" when done',
      ),
      createHeading('Adding a new scent profile', 'h2'),
      createParagraph(
        'If you add a new candle and want the quiz to be able to recommend it, create a new Scent Profile first, then go into the quiz and assign point scores to the new profile on the relevant answer options.',
      ),
      createHeading('How the scoring works', 'h2'),
      createParagraph(
        'Each answer option in the quiz can award points to one or more scent profiles. When a visitor finishes the quiz, the profile with the most points is shown as their result. You do not need to change the scoring unless you are adding new profiles or rebalancing the recommendations.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 10. Etsy Integration (was order 9)
  // ─────────────────────────────────────────────
  {
    title: 'Etsy Integration',
    slug: 'etsy-integration',
    order: 10,
    category: 'Etsy Integration',
    content: createRichText([
      createParagraph(
        'Your Candera website is connected to your Etsy shop. This connection uses something called an access token — think of it as a key that lets the two systems talk to each other.',
      ),
      createHeading('How the connection works', 'h2'),
      createParagraph(
        'When a visitor clicks "Buy" or is directed to purchase a candle, they are sent to your Etsy listing. The connection also allows your Etsy listing IDs to be stored on each product in your dashboard, so they stay linked.',
      ),
      createHeading('When the connection breaks', 'h2'),
      createParagraph(
        'Etsy access tokens expire after a period of time. When this happens, the integration will stop working. You will typically notice this because product links stop routing to Etsy correctly, or you see an error when trying to use Etsy-related features.',
      ),
      createHeading('How to renew your Etsy connection', 'h2'),
      createNumberedList(
        'Under the System section in the left menu, click "Etsy Tokens"',
        'You will see your current token and its expiry information',
        'If it has expired, click the "Reconnect Etsy" button or follow the re-authentication link provided',
        'You will be taken to Etsy to log in and approve the connection again',
        'Once approved, you will be redirected back and the token will be renewed automatically',
      ),
      createParagraph(
        'If you are unsure whether your Etsy connection is working, contact your developer to verify.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 11. Using Demo Content (was order 10)
  // ─────────────────────────────────────────────
  {
    title: 'Using the Demo Content',
    slug: 'using-demo-content',
    order: 11,
    category: 'CMS Usage',
    content: createRichText([
      createParagraph(
        'Your developer may have loaded some practice content to help you learn how things work. If present, these items are labelled TUTORIAL or PRACTICE so you can tell them apart from your real content. If you do not see them in your Products and Posts, your site simply started without them — that is perfectly fine, and the rest of this guide still applies.',
      ),
      createHeading('What demo content exists', 'h2'),
      createBulletList(
        'Products → "TUTORIAL: First Soy Candle" — a fully filled-out product showing you what all the fields look like when complete',
        'Products → "PRACTICE: Your Custom Blend" — a blank draft product for you to practise filling in',
        'Posts → "GUIDE: Writing for the Botanical Journal" — an example journal post',
        'Posts → "TUTORIAL: Using Blocks in Payload" — a guide to the page builder',
        'Media → "Instructional Guides" folder — example images used in the tutorial content',
        'Media → "Practice Assets" folder — example images for you to practise with',
      ),
      createHeading('What to do with it', 'h2'),
      createParagraph(
        'Open "TUTORIAL: First Soy Candle" in Products and read through all the tabs to see what a complete product entry looks like. Then open "PRACTICE: Your Custom Blend" and try filling it in yourself.',
      ),
      createParagraph(
        'These tutorial items are drafts and will not appear on your live site. When you are confident using the dashboard, you can delete them — they will not affect anything.',
      ),
      createHeading('How to delete demo content', 'h2'),
      createNumberedList(
        'Open the item you want to delete',
        'Click the three-dot menu icon near the top-right of the editor',
        'Select "Delete"',
        'Confirm the deletion',
      ),
      createParagraph(
        'Only delete the TUTORIAL and PRACTICE items. Do not delete any real products, posts, or pages.',
      ),
    ]) as Doc['content'],
  },

  // ─────────────────────────────────────────────
  // 12. Developer Reset (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'For Your Developer: Resetting Demo Data',
    slug: 'developer-reset-demo-data',
    order: 12,
    category: 'Seeding & Data',
    content: createRichText([
      createHeading('This page is for your developer', 'h2'),
      createParagraph(
        'This article describes a technical maintenance task. You do not need to use it for day-to-day editing — it is here so your developer has a reference.',
      ),
      createHeading('Warning: this erases content', 'h2'),
      createParagraph(
        'The reset (seed) process deletes existing content and replaces it with a fresh starter set. It must never be run on the live site unless the intent is to completely reset it.',
      ),
      createHeading('When it is used', 'h2'),
      createParagraph(
        'Resetting is for local development and staging environments where a clean, predictable set of starter content is wanted — for example, before a demo.',
      ),
      createParagraph(
        'If you ever think the site needs resetting, contact your developer rather than running it yourself.',
      ),
    ]) as Doc['content'],
  },
]

export const seedOwnerDocs = async (payload: Payload): Promise<void> => {
  payload.logger.info('— Seeding owner documentation (replace)...')

  const existing = await payload.find({ collection: 'documentation', limit: 1000, depth: 0 })
  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'documentation',
      id: doc.id,
      depth: 0,
      context: { disableRevalidate: true },
    })
  }

  for (const doc of OWNER_DOCS) {
    await payload.create({
      collection: 'documentation',
      depth: 0,
      context: { disableRevalidate: true },
      data: doc,
    })
  }
}
