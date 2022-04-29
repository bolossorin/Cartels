import React, { Component, Suspense } from 'react'
import { withRouter } from 'react-router'
import { Switch, Route, Redirect } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
import useClickStreamPageViews from '../hooks/useClickStreamPageViews'
import { withToastProvider } from './game/_common/Toast'

import './game/_common/Toast/Toast.scss'
import IntegratedLoader from './game/_common/Loading/IntegratedLoader'

const AsyncDashboardComponent = React.lazy(() => import('./game/Dashboard'))
const AsyncResetPasswordComponent = React.lazy(() =>
    import('./reset-password/ResetPassword.jsx')
)
const RebrandedLogin = React.lazy(() => import('./login'))

function App() {
    useClickStreamPageViews()

    return (
        <div className="app" id="app">
            <Suspense fallback={<IntegratedLoader text={`Loading...`} />}>
                <Switch>
                    <Route
                        path="/reset-password/:id/:token"
                        component={AsyncResetPasswordComponent}
                    />
                    {isAuthenticated() ? (
                        <Route path="/" component={AsyncDashboardComponent} />
                    ) : (
                        <Route exact path="/" component={RebrandedLogin} />
                    )}
                    {!isAuthenticated() && <Redirect to="/" />}
                </Switch>
            </Suspense>
        </div>
    )
}

export default withToastProvider(withRouter(App))
