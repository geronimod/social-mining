require 'rubygems'
require 'nokogiri'
require "pstore"

class Seeder

  SEED_COUNT = 1000

  REASONS    = [:laboral, :educacional, :casual]
  TRANSPORTS = [:car, :foot, :cycle] # train, horse
  EDUCATION  = [:secundario, :terciario, :universitario]
  SEX        = [:hombre, :mujer]
  ACTIVITY   = [:comercial, :otra]
  AGE        = Array(18..65)

  attr_reader   :streets
  attr_accessor :osm

  def initialize(osm_file = 'public/osm/tandil.osm')
    @osm = Nokogiri::XML(File.open(osm_file))
    @streets = read_streets
  end

  # DATA:
  # origen, destino, hora origen, hora destino, motivo, fecha, transporte,
  # nombre, sexo, actividad, nivel  educativo, edad
  def randomize(count = SEED_COUNT)
    [].tap do |data|
      (1..count).each do |ix|
        data << {
          :origin     => random_street(streets),
          :destiny    => random_street(streets),
          :start_at   => random_time,
          :end_at     => random_time,
          :reason     => REASONS[rand(REASONS.count)],
          :date       => random_time(0, Time.now, "%d-%m-%Y"),
          :transport  => TRANSPORTS[rand(TRANSPORTS.count)],
          :name       => "Subject #{ix}",
          :sex        => SEX[rand(2)],
          :activity   => ACTIVITY[rand(ACTIVITY.count)],
          :educaction => EDUCATION[rand(EDUCATION.count)],
          :age        => AGE[rand(AGE.count)]
        }
      end
    end
  end

  
  private

  def read_streets
    # <way id='129274110' timestamp='2011-09-07T23:49:00Z' uid='211657' user='pablopareja' visible='true' version='1' changeset='9241670'>
    #   <nd ref='1016290371' />
    #   <nd ref='1016290369' />
    #   <nd ref='1016290366' />
    #   <nd ref='1013986655' />
    #   <nd ref='1016290349' />
    #   <nd ref='1353162164' />
    #   <nd ref='1016290352' />
    #   <tag k='highway' v='residential' />
    #   <tag k='name' v='La Pesquería' />
    #   <tag k='oneway' v='yes' />
    # </way>
    
    streets = []

    store = PStore.new("streets.pstore")
    store.transaction do
      unless store[:streets] 
        # el tag way es definido un conjunto de nodos
        osm.css("way").each do |way|
          # en gral todas las calles contienen un tag con key highway 
          if way.css("tag[k='highway']").any? &&
             street_node = way.at("tag[k='name']")
            
            street = street_node['v']
            # solo necesito los id dado que plotroute rutea por id
            nodes  = way.css('nd').map { |e| e["ref"] }
            # nodes  = way.css('nd').map do |e|
            #   node_id = e["ref"]
            #   node = osm.at("node[id='#{node_id}']")
            #   [node["lat"], node["lon"]]
            # end
      
            streets[street] = nodes
            p "#{street} added"
          end
        end
      
        store[:streets] = streets
        store.commit
      end
      streets = store[:streets]
    end

    streets
  end

  def random_street(streets)
    street_nodes = streets[streets.keys[rand(streets.keys.count)]]
    street_nodes[rand(street_nodes.count)]
  end

  def random_time(from = 0.0, to = Time.now, mask = "%H:%M:%S")
    Time.at(from  + rand * (to.to_f - from.to_f)).strftime mask
  end

end

# seeder = Seeder.new
# p seeder.randomize