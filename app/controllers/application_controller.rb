class ApplicationController < ActionController::Base
  before_action :require_login

  inertia_share flash: -> { { notice: flash.notice, alert: flash.alert } }

  private

  def require_login
    return if session[:authed]
    redirect_to login_path
  end
end
