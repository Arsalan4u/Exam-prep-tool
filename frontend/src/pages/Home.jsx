import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Upload, BookOpen, Brain, TrendingUp, ArrowRight, Sparkles, Zap, Target, Users, CheckCircle, Star } from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/upload')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Study Assistant
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Smart Exam Preparation
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Transform your study materials into <span className="text-yellow-300 font-semibold">AI-powered summaries</span>, 
              practice with <span className="text-green-300 font-semibold">intelligent quizzes</span>, and 
              track your progress like never before
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {/* Primary CTA Button - FIXED */}
              <button
                onClick={handleGetStarted}
                className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 text-xl font-bold rounded-xl shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 transition-all duration-300 hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
              >
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                Get Started Free
              </button>
              
              {/* Secondary Button */}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-10 py-5 text-xl font-semibold border-2 border-white/70 text-white hover:bg-white hover:text-purple-700 rounded-xl transition-all duration-300 backdrop-blur-sm hover:border-white"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-pink-400" />
                <span>Smart Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 animate-float">
          <div className="w-16 h-16 bg-yellow-400/20 rounded-2xl backdrop-blur-sm border border-yellow-400/30 flex items-center justify-center">
            <Brain className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
        <div className="absolute bottom-20 left-10 animate-float-delay">
          <div className="w-20 h-20 bg-green-400/20 rounded-2xl backdrop-blur-sm border border-green-400/30 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-green-300" />
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to ace your exams, powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Upload className="h-8 w-8" />}
              title="Smart Upload"
              description="Upload PDFs, notes, and documents with automatic text extraction and intelligent processing"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              delay="0"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="AI Summaries"
              description="Get concise, intelligent summaries using advanced TextRank algorithms in seconds"
              color="bg-gradient-to-br from-green-500 to-green-600"
              delay="100"
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Smart Quizzes"
              description="Auto-generated practice quizzes tailored to your study material and learning pace"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              delay="200"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Progress Analytics"
              description="Track performance, identify weak areas, and optimize your study strategy with detailed insights"
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              delay="300"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="py-20 bg-white dark:bg-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Students Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of students who have improved their study efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StatCard 
              number="10,000+" 
              label="Documents Processed" 
              icon={<BookOpen className="w-8 h-8" />}
              color="text-blue-600"
            />
            <StatCard 
              number="50,000+" 
              label="Quizzes Generated" 
              icon={<Brain className="w-8 h-8" />}
              color="text-green-600"
            />
            <StatCard 
              number="95%" 
              label="Student Success Rate" 
              icon={<Star className="w-8 h-8" />}
              color="text-purple-600"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Study Experience?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students who have already revolutionized their exam preparation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 text-xl font-bold rounded-xl shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 transition-all duration-300 hover:from-yellow-300 hover:to-orange-400"
            >
              <Upload className="w-6 h-6" />
              Start Uploading Now
            </button>
            
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-semibold border-2 border-white/70 text-white hover:bg-white hover:text-purple-700 rounded-xl transition-all duration-300"
              >
                <TrendingUp className="w-6 h-6" />
                View Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, color, delay }) {
  return (
    <div 
      className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 hover:border-transparent transform hover:-translate-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`${color} text-white p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function StatCard({ number, label, icon, color }) {
  return (
    <div className="text-center group">
      <div className={`${color} mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">
        {label}
      </div>
    </div>
  )
}
