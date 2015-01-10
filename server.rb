require 'sinatra'
require 'nokogiri'
require 'open-uri'
require 'json'
require 'pry'

get "/" do
  File.read(File.join('public', 'index.html'))
end

get '/cricket/:series_id/:match_id' do
  data = JSON.parse(open("http://www.abc.net.au/dat/news/sport-data/live-scores/cricket/#{params[:series_id]}_#{params[:match_id]}_scorecard.json").read)
  data.to_json
end

get '/matches' do
  page = Nokogiri::HTML(open("http://abchtml.cricket.scoreboard.sportsflash.com.au/"))

  rows = page.css('.FixtureContentCenter > .HoverStyle')
  matches = []

  rows.each do |row|
    data = row.attributes['onclick'].value.strip.gsub("location.href='Default.aspx?",'').split('&')
    rowData = {}

    data.each do |keyVal|
      arr = keyVal.split('=')
      rowData[arr[0]] = arr[1]
    end

    row.css('.HomeControlTeamNameStyle').each_with_index do |team, i|
      rowData["team_#{i}"] = team.children[0].to_s
    end

    rowData["start_time"] = row.css('script')[0].children[0].to_s.strip.gsub('localizeDate(','').gsub(');','').to_s

    if rowData['venueId'].nil?
      matches.push rowData
    end
  end

  data = { matches: matches }.to_json
end
