import * as ReactDOM from 'react-dom';
import { RouterProvider } from 'react-router-dom';
import router from './router';

function render() {
  ReactDOM.render(
    <RouterProvider router={router}/>, 
    document.getElementById('root'));
}

render();