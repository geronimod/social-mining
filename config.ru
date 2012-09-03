require 'rubygems'
require 'rack/contrib'
require 'rack/rewrite'
require './app'

use Rack::Rewrite do
 rewrite '/', 'index.html'
end

# run Rack::Directory.new('public')
run Sinatra::Application