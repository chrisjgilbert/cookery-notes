class SessionsController < ApplicationController
  skip_before_action :require_login, only: [:new, :create]

  def new
    render inertia: "Login"
  end

  def create
    if password_matches?(params[:password].to_s)
      session[:authed] = true
      redirect_to root_path
    else
      redirect_to login_path, inertia: { errors: { password: "Incorrect password" } }
    end
  end

  def destroy
    reset_session
    redirect_to login_path
  end

  private

  def password_matches?(submitted)
    hash = Rails.application.credentials.app_password_hash!
    BCrypt::Password.new(hash).is_password?(submitted)
  rescue BCrypt::Errors::InvalidHash
    false
  end
end
