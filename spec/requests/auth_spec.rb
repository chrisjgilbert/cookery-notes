require "rails_helper"
require "bcrypt"

RSpec.describe "Auth", type: :request do
  let(:password) { "letmein" }

  before do
    hash = BCrypt::Password.create(password).to_s
    allow(Rails.application.credentials).to receive(:app_password_hash!).and_return(hash)
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
    post "/login", params: { password: password }
    expect(response).to redirect_to("/")
    expect(session[:authed]).to be true
  end

  it "logout clears session" do
    post "/login", params: { password: password }
    delete "/logout"
    expect(response).to redirect_to("/login")
    expect(session[:authed]).to be_nil
  end
end
