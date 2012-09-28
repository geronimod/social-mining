# encoding: utf-8
require "bundler/setup"
require 'sinatra'
require "sinatra/reloader" if development?
require 'json'
require './seeder'
require 'benchmark'
require 'mormon'
require 'debugger'
# json array of routing 
get '/routes.?:format?' do
  # TODO read from db the routing nodes
  content_type :json
  
  routes      = []
  random_data = []
  threads     = []
  
  osm_file   = "public/osm/tandil.osm"
  osm_loader = Mormon::OSM::Loader.new osm_file
  osm_router = Mormon::OSM::Router.new osm_loader
  seeder     = Seeder.new osm_file
  
  random_data = seeder.randomize(params[:limit].to_i || 100)
  
  random_data.each do |data|
    threads << Thread.new do
      response, route = osm_router.find_route data[:origin].to_i, data[:destiny].to_i, data[:transport]
      if response != "success"
        p "Route Failed: #{response} #{data[:origin]} #{data[:destiny]}"
      else
        data[:route] = route
      end
    end
  end

  puts Benchmark.measure { threads.map &:join }
  random_data.to_json
end

get '/route/:from/:to.?:format?' do
  
end