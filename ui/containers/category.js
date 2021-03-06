import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import DocumentTitle from 'react-document-title';

import {
  Input,
  Button,
  ButtonGroup,
  Breadcrumb,
  BreadcrumbItem,
} from 'react-bootstrap';

import * as actions from '../actions';
import { channelsSelector, categorySelector } from '../selectors';
import Pager from '../components/pager';
import Icon from '../components/icon';
import Loading from '../components/loading';
import ChannelItem from '../components/channel_item';
import { getTitle } from './utils';

export class Category extends React.Component {

  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    this.actions = bindActionCreators(actions.channels, dispatch);
    this.handleFilterChannels = this.handleFilterChannels.bind(this);
    this.handleClearFilter = this.handleClearFilter.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSelectPage = this.handleSelectPage.bind(this);
  }

  handleClearFilter() {
    this.refs.filter.getInputDOMNode().value = '';
    this.actions.filterChannels('');
  }

  handleFilterChannels(event) {
    event.preventDefault();
    const value = _.trim(this.refs.filter.getValue());
    this.actions.filterChannels(value);
  }

  handleSelectPage(page) {
    window.scrollTo(0, 0);
    this.actions.selectPage(page);
  }

  handleSelect() {
    this.refs.filter.getInputDOMNode().select();
  }

  renderBreadcrumbs() {
    const { createHref } = this.context.router;
    const { category } = this.props;

    const items = [<BreadcrumbItem key="all" href={createHref('/browse/')}>Browse</BreadcrumbItem>];
    let parent = category.parent;
    while (parent) {
      items.push(
      <BreadcrumbItem key={parent.id} href={createHref(`/categories/${parent.id}/`)}>
      {parent.name}
      </BreadcrumbItem>);
      parent = parent.parent;
    }
    items.push(<BreadcrumbItem key="active" active>{category.name}</BreadcrumbItem>);
    return <Breadcrumb>{items}</Breadcrumb>;
  }

  renderChildren() {
    const { category } = this.props;
    return (
      <div className="text-center">
        <ButtonGroup>
          {category.children.map(child => {
            return (
            <Link
              key={child.id}
              className="btn btn-info"
              to={`/categories/${child.id}/`}
            >{child.name}</Link>
            );
          })}
        </ButtonGroup>
      </div>
    );
  }

  render() {
    const {
      channels,
      filter,
      unfilteredChannels,
      isLoading,
      category,
      page } = this.props;

    if (isLoading) {
      return <Loading />;
    }

    if (!category || _.isEmpty(unfilteredChannels)) {
      return (
        <span>There are no feeds for this category.
          Discover new channels and podcasts <Link to="/search/">here</Link>.</span>);
    }

    const pager = <Pager page={page} onSelectPage={this.handleSelectPage} />;

    return (
      <DocumentTitle title={getTitle(`Category: ${category.name}`)}>
      <div>
        {this.renderBreadcrumbs()}
        {this.renderChildren()}
        <form onSubmit={this.handleFilterChannels}>
          <Input
            className="form-control"
            type="search"
            ref="filter"
            onClick={this.handleSelect}
            placeholder="Find a feed in this category"
          />
          <Input>
            <Button
              type="submit"
              bsStyle="primary"
              className="form-control"
            >
              <Icon icon="search" /> Search
            </Button>
          </Input>
          {filter ?
          <Input>
            <Button
              onClick={this.handleClearFilter}
              className="form-control"
            >
              <Icon icon="refresh" /> Show all
            </Button>
          </Input> : ''}
      </form>
        {pager}
        {channels.map(channel => {
          const toggleSubscribe = () => {
            this.props.dispatch(actions.subscribe.toggleSubscribe(channel));
          };
          return (
            <ChannelItem
              key={channel.id}
              showImage={false}
              channel={channel}
              isLoggedIn={this.props.isLoggedIn}
              subscribe={toggleSubscribe}
            />
          );
        })}
        {pager}
      </div>
    </DocumentTitle>
    );
  }
}

Category.propTypes = {
  channels: PropTypes.array.isRequired,
  filter: PropTypes.string.isRequired,
  category: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  page: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  unfilteredChannels: PropTypes.array.isRequired,
};

Category.contextTypes = {
  router: PropTypes.object,
};

const mapStateToProps = state => {
  return Object.assign({},
    channelsSelector(state), {
      isLoading: state.channels.isLoading,
      filter: state.channels.filter,
      category: categorySelector(state),
      isLoggedIn: state.auth.isLoggedIn,
    });
};

export default connect(mapStateToProps)(Category);
