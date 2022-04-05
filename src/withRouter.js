import {
  useLocation, useNavigate, useParams, useSearchParams
} from "react-router-dom";

export function withRouter( Child ) {
  return ( props ) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    let [ searchParams ] = useSearchParams();
    return <Child { ...props } navigate={ navigate } location={ location } params = { params } searchParams = { searchParams } />;
  }
}
