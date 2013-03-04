# encoding: utf-8
require "bundler/setup"
require 'sinatra'
require 'json'
require './seeder'
require 'mormon'

if development?
  require 'benchmark'
  require "sinatra/reloader"
  require 'debugger'
end

before do
  Mormon::OSM::Loader.cache_dir = "public/mormon/cache"
  @osm_file   = "public/osm/tandil.osm"
  @osm_loader = Mormon::OSM::Loader.new @osm_file, :cache => true
  @osm_router = Mormon::OSM::Router.new @osm_loader, :algorithm => :random, :breadth => 1
end

# json array of routing 
get '/routes.?:format?' do
  # TODO read from db the routing nodes
  content_type :json
  
  routes      = []
  random_data = []
  threads     = []
  
  seeder = Seeder.new @osm_file
  random_data = seeder.randomize(params[:limit] && params[:limit].to_i || 100)
  
  random_data.each do |data|
    # threads << Thread.new do
      # debugger
      response, route = @osm_router.find_route data[:origin], data[:destiny], data[:transport]
      if response != "success"
        p "Route Failed: #{response} #{data[:origin]} #{data[:destiny]} #{data[:transport]}"
      else
        data[:route] = route
      end
    # end
  end

  # if development?
  #   puts Benchmark.measure { threads.map &:join }
  # else
  #   threads.map &:join
  # end
  
  random_data.to_json
end

get '/route/:from/:to/by/:transport.?:format?' do
  response, route = @osm_router.find_route params[:from], params[:to], params[:transport]
  if response != "success"
    p "Route Failed: #{response} #{params[:from]} #{params[:to]} #{params[:transport]}"
  else
    route.to_json
  end
end