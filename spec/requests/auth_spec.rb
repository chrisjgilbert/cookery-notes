require "rails_helper"

RSpec.describe "Auth", type: :request do
  before do
    ENV["APP_PASSWORD_HASH"] = nil
    ENV["APP_PASSWORD"] = "letmein"
  end

  it "redirects unauthenticated root to /login" do
    get "/"
    expect(response).to redirect_to("/login")
  end

  it "rejects wrong password" do
    post "/login", params: { password: "nope" }
    expect(response).to redirect_to("/login")
    follow_redirect!
    expect(session[:authed]).to be_nil
  end

  it "logs in with correct password and redirects to root" do
    post "/login", params: { password: "letmein" }
    expect(response).to redirect_to("/")
    expect(session[:authed]).to be true
  end

  it "logout clears session" do
    post "/login", params: { password: "letmein" }
    delete "/logout"
    expect(response).to redirect_to("/login")
    expect(session[:authed]).to be_nil
  end
end
