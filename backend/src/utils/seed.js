require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Creator = require('../models/Creator');
const Video = require('../models/Video');
const connectDB = require('../config/db');

const categories = [
  { title: 'Web Development', slug: 'web-development', description: 'Learn HTML, CSS, and modern web technologies' },
  { title: 'React', slug: 'react', description: 'Master React.js for building interactive UIs' },
  { title: 'Node.js', slug: 'nodejs', description: 'Server-side JavaScript with Node.js and Express' },
  { title: 'JavaScript', slug: 'javascript', description: 'Core JavaScript programming concepts' },
  { title: 'MongoDB', slug: 'mongodb', description: 'NoSQL database design and queries' },
  { title: 'Java', slug: 'java', description: 'Object-oriented programming with Java' },
  { title: 'Python', slug: 'python', description: 'Python programming from basics to advanced' },
  { title: 'Data Science', slug: 'data-science', description: 'Data analysis, visualization, and ML basics' },
  { title: 'AI', slug: 'ai', description: 'Artificial Intelligence and machine learning' },
  { title: 'DevOps', slug: 'devops', description: 'CI/CD, Docker, Kubernetes, and cloud deployment' },
  { title: 'Mobile Development', slug: 'mobile-development', description: 'Build mobile apps with React Native and Flutter' },
];

const seed = async () => {
  await connectDB();

  console.log('Seeding database...');

  // Admin user
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@skilllearn.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@skilllearn.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin user created');
  }

  // Categories
  for (const cat of categories) {
    await Category.findOneAndUpdate({ title: cat.title }, cat, { upsert: true, new: true });
  }
  console.log('Categories seeded');

  // Demo creator and videos (only if no videos exist)
  const videoCount = await Video.countDocuments();
  if (videoCount === 0) {
    const demoUser = await User.findOneAndUpdate(
      { email: 'creator@skilllearn.com' },
      {
        name: 'Tech Guru',
        email: 'creator@skilllearn.com',
        password: 'Creator@123',
        role: 'creator',
        isVerified: true,
        bio: 'Teaching tech skills one short video at a time',
      },
      { upsert: true, new: true }
    );

    const creator = await Creator.findOneAndUpdate(
      { userId: demoUser._id },
      {
        userId: demoUser._id,
        displayName: 'Tech Guru',
        bio: 'Full-stack developer & educator',
        isVerified: true,
      },
      { upsert: true, new: true }
    );

    const reactCat = await Category.findOne({ title: 'React' });
    const jsCat = await Category.findOne({ title: 'JavaScript' });

    const sampleVideos = [
      {
        title: 'React Hooks in 60 Seconds',
        description: 'Quick intro to useState and useEffect',
        thumbnail: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        videoUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        category: reactCat._id,
        creator: creator._id,
        duration: 60,
        tags: ['react', 'hooks', 'javascript'],
        views: 1250,
      },
      {
        title: 'JavaScript Closures Explained',
        description: 'Understand closures with a simple example',
        thumbnail: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        videoUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        category: jsCat._id,
        creator: creator._id,
        duration: 45,
        tags: ['javascript', 'closures'],
        views: 890,
      },
    ];

    await Video.insertMany(sampleVideos);
    await Creator.findByIdAndUpdate(creator._id, { totalVideos: sampleVideos.length });
    console.log('Sample videos created');
  }

  console.log('Seed completed!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
