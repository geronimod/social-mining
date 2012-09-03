# encoding: utf-8

require 'sinatra'
require "sinatra/reloader" if development?
require 'json'
require './seeder'
require 'benchmark'

# json array of routing 
get '/routes.?:format?' do
  # TODO read from db the routing nodes
  content_type :json
  
  routes      = []
  random_data = []
  threads     = []
  
  osm_file = "public/osm/tandil.osm"
  seeder   = Seeder.new osm_file
  
  random_data = seeder.randomize(params[:limit].to_i || 100)
  
  random_data.each do |data|
    threads << Thread.new do
      route = `python plotroute/route.py #{osm_file} #{data[:origin]} #{data[:destiny]} #{data[:transport]}`
      
      if route.include?('Failed')
        p "Route Failed: #{data[:origin]} #{data[:destiny]}"
      else
        route.tr! '()','[]'
        data[:route] = JSON.parse(route)
      end
    end
  end

  puts Benchmark.measure { threads.map &:join }
  random_data.to_json
end

get '/route/:from/:to.?:format?' do
  
end