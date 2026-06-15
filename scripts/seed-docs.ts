import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedLogger } from '@/utilities/logger'

// Helper to build a Lexical root from an array of block nodes
function doc(...children: object[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function p(text: string) {
  return {
    type: 'paragraph',
    children: [{ text, version: 1 }],
    version: 1,
  }
}

function h2(text: string) {
  return {
    type: 'heading',
    tag: 'h2',
    children: [{ text, version: 1 }],
    version: 1,
  }
}

function ul(...items: string[]) {
  return {
    type: 'list',
    listType: 'bullet',
    children: items.map((text) => ({
      type: 'listitem',
      children: [{ text, version: 1 }],
      version: 1,
    })),
    version: 1,
  }
}

function ol(...items: string[]) {
  return {
    type: 'list',
    listType: 'number',
    children: items.map((text) => ({
      type: 'listitem',
      children: [{ text, version: 1 }],
      version: 1,
    })),
    version: 1,
  }
}

const DOCS_TO_SEED = [
  // ─────────────────────────────────────────────
  // 1. Welcome & Orientation
  // ─────────────────────────────────────────────
  {
    title: 'Welcome to Your Dashboard',
    slug: 'welcome-to-candera',
    order: 1,
    content: doc(
      p(
        'This is your Candera admin dashboard — the place where you manage everything on your website, from candle listings to journal posts to the homepage layout.',
      ),
      p(
        'You do not need any technical knowledge to use it. This guide and the articles below will walk you through every area step by step.',
      ),
      h2('How the dashboard is organised'),
      p('On the left side of the screen you will see a menu. It is split into two types of areas:'),
      ul(
        'Collections — these are lists of things you can create, edit, and delete. Products, journal posts, media images, and quiz content are all collections.',
        'Globals — these are single settings pages that control site-wide things like your navigation menu and footer.',
      ),
      h2('Your collections at a glance'),
      ul(
        'Pages — the content on pages like your homepage, about page, and contact page',
        'Products — your candle listings',
        'Posts — journal articles that appear in your blog',
        'Media — all images and files you have uploaded',
        'Categories — labels used to group products and posts',
        'Quizzes — the scent quiz questions and answer options',
        'Scent Profiles — the results that the scent quiz recommends (e.g. "Intimate", "Meadowlight")',
        'Briefs — internal notes and project briefs, not visible to visitors',
        'Users — admin accounts that can log in to this dashboard',
      ),
      h2('Your globals at a glance'),
      ul(
        'Header — your site navigation links',
        'Footer — your footer links and text',
        'Site Theme — your brand colours and visual settings',
      ),
      h2('Where to start'),
      p(
        'If you are new, the best first step is to open Products and review your candle listings. Then check the Header global to make sure your navigation links are correct.',
      ),
      p(
        'Each article in this documentation section covers one area in detail. You can read them in order or jump to the one you need.',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 2. Draft vs Published
  // ─────────────────────────────────────────────
  {
    title: 'Drafts, Publishing, and Saving',
    slug: 'drafts-and-publishing',
    order: 2,
    content: doc(
      p(
        'Every piece of content in your dashboard — products, posts, and pages — can exist in one of two states: Draft or Published.',
      ),
      h2('What draft means'),
      p(
        'A draft is saved but invisible to visitors on your live website. You can edit it freely without anything changing on the public site. Use drafts when you are working on something that is not ready yet.',
      ),
      h2('What published means'),
      p(
        'A published item is live on your website and visible to anyone who visits. When you publish something, it goes live immediately.',
      ),
      h2('How to save a draft'),
      ol(
        'Open the item you want to edit (for example, a product)',
        'Make your changes',
        'Click the "Save Draft" button in the top-right corner',
        'Your changes are saved but the live site is unchanged',
      ),
      h2('How to publish'),
      ol(
        'Open the item you want to publish',
        'Make sure everything looks correct',
        'Click the "Publish" button in the top-right corner',
        'The item is now live on your website',
      ),
      h2('How to preview before publishing'),
      p(
        'On products and posts, you will see a "Preview" button near the top of the edit screen. Click it to open a live preview of the page as it will appear to visitors — before you publish. You can switch between Mobile, Tablet, and Desktop views using the buttons at the top of the preview panel.',
      ),
      h2('Unpublishing something'),
      p(
        'To take something off your live site without deleting it, open the item and change its status back to Draft using the status dropdown in the top-right area, then save. It will disappear from the public site but remain in your dashboard.',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 3. Managing Pages
  // ─────────────────────────────────────────────
  {
    title: 'Editing Your Pages',
    slug: 'managing-pages',
    order: 3,
    content: doc(
      p(
        'Your website has several static pages — the homepage, about page, contact page, and others. You can edit all of them from the Pages collection.',
      ),
      h2('How to edit a page'),
      ol(
        'Click "Pages" in the left menu',
        'Click on the page you want to edit (for example, "Home")',
        'The page will open in an editor with a list of sections called "layout blocks"',
        'Click on any block to expand it and edit the text, images, or settings inside',
        'When you are done, click "Save Draft" to save without publishing, or "Publish" to make your changes live',
      ),
      h2('The homepage'),
      p(
        'The homepage is made up of several blocks stacked on top of each other. Each block controls one section of the page:',
      ),
      ul(
        'Storefront Hero — the large opening section with the headline, sub-line, and main call-to-action buttons',
        'Archive Block — the product grid or journal grid section',
        'Testimonials — the customer quote section',
        'Scent Quiz — the "Find Your Scent" section and quiz trigger',
        'Inner Circle CTA — the email sign-up section at the bottom',
      ),
      h2('Editing the homepage headline'),
      ol(
        'Open Pages and click "Home"',
        'Scroll down to the Layout section and find the "Storefront Hero" block',
        'Click to expand it',
        'Edit the "Headline" and "Subheading" fields',
        'Click Publish when done',
      ),
      h2('Adding or removing blocks'),
      p(
        'You can reorder blocks by dragging the handle on the left side of each block. To remove a block, click the three-dot menu on the right side and select "Remove". To add a new block, scroll to the bottom of the layout and click "Add Block", then choose the block type.',
      ),
      p(
        'Be careful when removing blocks — there is no undo. If you accidentally remove a block, do not save, and refresh the page to restore it.',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 4. Managing Products
  // ─────────────────────────────────────────────
  {
    title: 'Managing Your Products',
    slug: 'managing-products',
    order: 4,
    content: doc(
      p(
        'Your candle listings live in the Products collection. From here you can add new candles, update descriptions and prices, manage images, and control what appears on your live store.',
      ),
      h2('How to edit an existing product'),
      ol(
        'Click "Products" in the left menu',
        'Find the product you want to edit and click on it',
        'The product editor will open with several tabs across the top: Content, Scent Profile, Specifications, SEO',
        'Edit the fields you want to change',
        'Click "Save Draft" to save without publishing, or "Publish" to go live',
      ),
      h2('What each tab contains'),
      ul(
        'Content — the product title, tagline, price, main description, and hero image',
        'Scent Profile — the scent notes, burn time, wax type, and botanical details',
        'Specifications — vessel size, weight, and other technical details',
        'SEO — the title and description that appear in Google search results',
      ),
      h2('How to add a new product'),
      ol(
        'Click "Products" in the left menu',
        'Click the "Create New" button in the top-right corner',
        'Fill in the Title field first — this is the candle name',
        'Fill in the Slug field — this becomes the URL (e.g. "wild-lilac" becomes canderastudio.com/products/wild-lilac)',
        'Fill in the remaining fields across the tabs',
        'Add a product image in the Content tab by clicking the image upload area',
        'Set the status to Draft while you work, then Publish when ready',
      ),
      h2('How to add a product image'),
      ol(
        'Open the product and go to the Content tab',
        'Click the image upload area or the "Choose from Media" button',
        'Either upload a new image from your computer, or select one you have already uploaded',
        'Click "Select" to attach it to the product',
      ),
      h2('Taking a product off the site temporarily'),
      p(
        'Change the product status from Published to Draft and save. It will disappear from your store but remain in your dashboard. Publish it again whenever you are ready.',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 5. Writing Journal Posts
  // ─────────────────────────────────────────────
  {
    title: 'Writing Journal Posts',
    slug: 'writing-posts',
    order: 5,
    content: doc(
      p(
        'Your journal is where you share stories, rituals, behind-the-scenes writing, and anything else you want to say. Posts live in the Posts collection.',
      ),
      h2('How to write a new post'),
      ol(
        'Click "Posts" in the left menu',
        'Click "Create New" in the top-right corner',
        'Enter a title for your post',
        'Add a hero image — this appears at the top of the post and in journal listings',
        'Write your content in the large text area below',
        'Fill in the SEO tab with a search-friendly title and description',
        'Save as Draft while you write, then Publish when ready',
      ),
      h2('Using the text editor'),
      p(
        'The text editor works like a simple word processor. You can type directly into it. To format text, select it with your mouse — a toolbar will appear with options for bold, italic, headings, links, and bullet lists.',
      ),
      p(
        'To add an image inside your post, click the "+" icon that appears on a new blank line, then choose "Image" from the menu that appears. You can upload a new image or choose one from your media library.',
      ),
      h2('Adding categories'),
      p(
        'Categories help visitors find related posts. To add one, scroll down to the "Categories" field on the post editor and select from the available options. You can manage your categories from the Categories collection in the left menu.',
      ),
      h2('Editing an existing post'),
      ol(
        'Click "Posts" in the left menu',
        'Click on the post you want to edit',
        'Make your changes',
        'Click "Publish" — the updated version goes live immediately',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 6. Uploading and Managing Media
  // ─────────────────────────────────────────────
  {
    title: 'Uploading and Managing Images',
    slug: 'managing-media',
    order: 6,
    content: doc(
      p(
        'All images and files on your site are stored in the Media collection. You can upload new images here and then attach them to products, posts, or pages.',
      ),
      h2('How to upload a new image'),
      ol(
        'Click "Media" in the left menu',
        'Click "Create New" in the top-right corner',
        'Click the upload area, or drag and drop an image file from your computer',
        'Fill in the "Alt Text" field — this is a short description of the image (for example, "Wild Lilac candle on a marble surface")',
        'Click "Save" to finish',
      ),
      h2('What is alt text and why does it matter'),
      p(
        'Alt text is a short description you attach to every image. It is used by search engines to understand what the image shows, and by screen readers for visitors with visual impairments. Always fill it in — it helps your site appear in Google image search results.',
      ),
      h2('Organising images into folders'),
      p(
        'The Media collection supports folders. You can create folders to keep your images organised — for example, one folder for product photos and another for journal images. To move an image into a folder, open the image, find the "Folder" field, and select the folder you want.',
      ),
      h2('How to attach an image to a product or post'),
      p(
        'You do not attach images from the Media collection directly. Instead, open the product or post you want to edit, find the image field, and click "Choose from Media". A browser will open showing your uploaded images — click the one you want and click "Select".',
      ),
      h2('Image size recommendations'),
      ul(
        'Product images: at least 1200 × 1200 pixels, square format works best',
        'Post hero images: at least 1600 × 900 pixels, landscape format',
        'File format: JPG or WebP for photos, PNG for images with transparent backgrounds',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 7. Navigation and Footer
  // ─────────────────────────────────────────────
  {
    title: 'Editing Your Navigation and Footer',
    slug: 'navigation-and-footer',
    order: 7,
    content: doc(
      p(
        'Your site navigation (the links at the top of every page) and your footer are controlled by Globals. Globals are site-wide settings — there is only one of each, and changes apply everywhere immediately.',
      ),
      h2('How to edit your navigation'),
      ol(
        'Click "Header" under the Globals section in the left menu',
        'You will see a list of navigation links',
        'To edit a link, click on it and change the label or destination URL',
        'To add a new link, click "Add Link" at the bottom of the list',
        'To remove a link, click the remove icon next to it',
        'Click "Save" when done — changes go live immediately, there is no draft mode for globals',
      ),
      h2('How to edit your footer'),
      ol(
        'Click "Footer" under the Globals section in the left menu',
        'Edit the links and text in the footer sections',
        'Click "Save" when done',
      ),
      h2('Important: globals have no draft mode'),
      p(
        'Unlike products and posts, globals do not have a Draft state. When you click Save, the change goes live on your site immediately. Double-check your changes before saving.',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 8. Scent Quiz and Scent Profiles
  // ─────────────────────────────────────────────
  {
    title: 'Managing the Scent Quiz',
    slug: 'managing-scent-quiz',
    order: 8,
    content: doc(
      p(
        'The scent quiz helps visitors find the right candle for them. It is made up of two parts: the Quiz (the questions and answer options) and the Scent Profiles (the results the quiz recommends).',
      ),
      h2('Editing the quiz questions'),
      ol(
        'Click "Quizzes" in the left menu',
        'Click on "Candera Scent Ritual Quiz"',
        'You will see a list of questions — click any question to expand it and edit the prompt text',
        'Each question has a list of answer options — click an option to edit its label',
        'Each option has scores that point to a scent profile — these control which result the quiz recommends based on answers',
        'Click "Save" when done',
      ),
      h2('Editing the quiz results (Scent Profiles)'),
      ol(
        'Click "Scent Profiles" in the left menu',
        'Click on the profile you want to edit (for example, "Intimate")',
        'You can edit the profile name, the editorial quote that appears on the result screen, and the botanical composition notes',
        'You can also change the "Featured Product" — this is the candle the quiz recommends for this profile',
        'The "Ambient Image" is the background image that fades in when this result appears',
        'Click "Save" when done',
      ),
      h2('Adding a new scent profile'),
      p(
        'If you add a new candle and want the quiz to be able to recommend it, create a new Scent Profile first, then go into the quiz and assign point scores to the new profile on the relevant answer options.',
      ),
      h2('How the scoring works'),
      p(
        'Each answer option in the quiz can award points to one or more scent profiles. When a visitor finishes the quiz, the profile with the most points is shown as their result. You do not need to change the scoring unless you are adding new profiles or rebalancing the recommendations.',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 9. Etsy Integration
  // ─────────────────────────────────────────────
  {
    title: 'Etsy Integration',
    slug: 'etsy-integration',
    order: 9,
    content: doc(
      p(
        'Your Candera website is connected to your Etsy shop. This connection uses something called an access token — think of it as a key that lets the two systems talk to each other.',
      ),
      h2('How the connection works'),
      p(
        'When a visitor clicks "Buy" or is directed to purchase a candle, they are sent to your Etsy listing. The connection also allows your Etsy listing IDs to be stored on each product in your dashboard, so they stay linked.',
      ),
      h2('When the connection breaks'),
      p(
        'Etsy access tokens expire after a period of time. When this happens, the integration will stop working. You will typically notice this because product links stop routing to Etsy correctly, or you see an error when trying to use Etsy-related features.',
      ),
      h2('How to renew your Etsy connection'),
      ol(
        'Click "Etsy Tokens" in the left menu',
        'You will see your current token and its expiry information',
        'If it has expired, click the "Reconnect Etsy" button or follow the re-authentication link provided',
        'You will be taken to Etsy to log in and approve the connection again',
        'Once approved, you will be redirected back and the token will be renewed automatically',
      ),
      p(
        'If you are unsure whether your Etsy connection is working, contact your developer to verify.',
      ),
    ),
  },

  // ─────────────────────────────────────────────
  // 10. Using the Demo Content
  // ─────────────────────────────────────────────
  {
    title: 'Using the Demo Content',
    slug: 'using-demo-content',
    order: 10,
    content: doc(
      p(
        'Your dashboard was set up with some example content to help you learn how things work. These items are labelled TUTORIAL or PRACTICE so you can tell them apart from your real content.',
      ),
      h2('What demo content exists'),
      ul(
        'Products → "TUTORIAL: First Soy Candle" — a fully filled-out product showing you what all the fields look like when complete',
        'Products → "PRACTICE: Your Custom Blend" — a blank draft product for you to practise filling in',
        'Posts → "GUIDE: Writing for the Botanical Journal" — an example journal post',
        'Posts → "TUTORIAL: Using Blocks in Payload" — a guide to the page builder',
        'Media → "Instructional Guides" folder — example images used in the tutorial content',
        'Media → "Practice Assets" folder — example images for you to practise with',
      ),
      h2('What to do with it'),
      p(
        'Open "TUTORIAL: First Soy Candle" in Products and read through all the tabs to see what a complete product entry looks like. Then open "PRACTICE: Your Custom Blend" and try filling it in yourself.',
      ),
      p(
        'These tutorial items are drafts and will not appear on your live site. When you are confident using the dashboard, you can delete them — they will not affect anything.',
      ),
      h2('How to delete demo content'),
      ol(
        'Open the item you want to delete',
        'Click the three-dot menu icon near the top-right of the editor',
        'Select "Delete"',
        'Confirm the deletion',
      ),
      p(
        'Only delete the TUTORIAL and PRACTICE items. Do not delete any real products, posts, or pages.',
      ),
    ),
  },
]

async function seedDocs(): Promise<void> {
  const payload = await getPayload({ config })

  seedLogger.info('Seeding user documentation...')

  for (const docData of DOCS_TO_SEED) {
    const { totalDocs: existingCount } = await payload.find({
      collection: 'documentation',
      where: { slug: { equals: docData.slug } },
      limit: 1,
    })

    if (existingCount > 0) {
      seedLogger.info(`Doc "${docData.title}" already exists. Skipping.`)
      continue
    }

    seedLogger.info(`Creating doc: ${docData.title}...`)
    await payload.create({
      collection: 'documentation',
      // @ts-expect-error - content shape is valid Lexical JSON but doesn't match strict generated type
      data: docData,
    })
    seedLogger.success(`Doc "${docData.title}" seeded successfully.`)
  }
}

seedDocs()
  .then(() => {
    seedLogger.success('Documentation seeding complete.')
    process.exit(0)
  })
  .catch((err) => {
    seedLogger.error('Failed to seed documentation:', err)
    process.exit(1)
  })
