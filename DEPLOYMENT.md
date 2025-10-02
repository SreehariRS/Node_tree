# Deployment Guide

This guide will help you deploy your Node Tree App with the frontend on Vercel and backend on Render.

## Prerequisites

1. GitHub account with your code pushed to a repository
2. Vercel account (sign up at vercel.com)
3. Render account (sign up at render.com)
4. MongoDB Atlas database (or any MongoDB instance accessible from the internet)

## Backend Deployment on Render

### Step 1: Prepare Your Repository
Make sure your backend code is in the `backend/` directory and pushed to GitHub.

### Step 2: Create a New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `your-app-name-backend` (choose a unique name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install` (or leave empty)
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables on Render
In your Render service settings, add these environment variables:
- `MONGO_URI`: Your MongoDB connection string
- `FRONTEND_URL`: `https://your-vercel-app-name.vercel.app` (you'll get this after Vercel deployment)
- `NODE_ENV`: `production`

### Step 4: Deploy
Click "Create Web Service" and wait for the deployment to complete.
Note down your Render URL: `https://your-app-name-backend.onrender.com`

## Frontend Deployment on Vercel

### Step 1: Create Environment File
Create a `.env.local` file in your `node_tree_app` directory:
```
NEXT_PUBLIC_API_URL=https://your-app-name-backend.onrender.com
```

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `node_tree_app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Set Environment Variables on Vercel
**IMPORTANT**: You need to set this BEFORE deploying or during the deployment process.

Option 1 - During Deployment:
- When Vercel asks for environment variables during deployment, add:
  - Key: `NEXT_PUBLIC_API_URL`
  - Value: `https://your-app-name-backend.onrender.com`

Option 2 - After Deployment:
- Go to your Vercel project dashboard
- Click "Settings" → "Environment Variables"
- Add: `NEXT_PUBLIC_API_URL` = `https://your-app-name-backend.onrender.com`
- Redeploy the project

### Step 4: Deploy
Click "Deploy" and wait for the deployment to complete.

## Post-Deployment Steps

### Update Backend CORS
1. Go back to your Render service
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL
3. Redeploy the service

### Test Your Application
1. Visit your Vercel URL
2. Try creating, editing, and deleting nodes
3. Check that all functionality works correctly

## Environment Variables Summary

### Backend (Render)
- `MONGO_URI`: MongoDB connection string
- `FRONTEND_URL`: Your Vercel app URL
- `NODE_ENV`: production

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: Your Render backend URL

## Troubleshooting

### CORS Issues
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check that both HTTP and HTTPS are handled correctly

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check that your Render service is running and accessible

### Database Connection Issues
- Verify your MongoDB connection string is correct
- Ensure your MongoDB instance allows connections from Render's IP ranges

## Free Tier Limitations

### Render Free Tier
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30+ seconds
- 750 hours per month limit

### Vercel Free Tier
- 100GB bandwidth per month
- Unlimited deployments
- Custom domains supported

## Upgrading to Production

For production use, consider:
1. Upgrading to paid plans for better performance
2. Setting up custom domains
3. Implementing proper logging and monitoring
4. Adding SSL certificates (handled automatically by both platforms)
5. Setting up CI/CD pipelines for automated deployments
